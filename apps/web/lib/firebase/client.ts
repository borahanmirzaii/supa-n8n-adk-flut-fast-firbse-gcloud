/**
 * Firebase client with proper error handling and retry logic
 * Provides authentication functions with comprehensive error handling
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator, type Storage } from "firebase/storage";
import { env } from "../env";
import { logger } from "../logger";

let app: FirebaseApp;
let authInstance: Auth;
let firestoreInstance: Firestore;
let storageInstance: Storage;

const isDevelopment = process.env.NODE_ENV === "development";
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

/**
 * Get or initialize Firebase app
 */
export const getFirebaseApp = (): FirebaseApp => {
  if (!getApps().length) {
    try {
      app = initializeApp({
        apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
      logger.info("Firebase app initialized");

      // Connect to emulators in development
      if (isDevelopment && useEmulators) {
        // Auth emulator
        if (!authInstance) {
          authInstance = getAuth(app);
          try {
            connectAuthEmulator(authInstance, "http://localhost:9099", {
              disableWarnings: true,
            });
            logger.info("Connected to Auth emulator");
          } catch (error) {
            // Already connected, ignore
          }
        }

        // Firestore emulator
        if (!firestoreInstance) {
          firestoreInstance = getFirestore(app);
          try {
            connectFirestoreEmulator(firestoreInstance, "localhost", 8081);
            logger.info("Connected to Firestore emulator");
          } catch (error) {
            // Already connected, ignore
          }
        }

        // Storage emulator
        if (!storageInstance) {
          storageInstance = getStorage(app);
          try {
            connectStorageEmulator(storageInstance, "localhost", 9199);
            logger.info("Connected to Storage emulator");
          } catch (error) {
            // Already connected, ignore
          }
        }
      }
    } catch (error) {
      logger.error({ error }, "Failed to initialize Firebase app");
      throw new Error("Failed to initialize Firebase. Please check your configuration.");
    }
  }
  return app;
};

/**
 * Get Firebase Auth instance
 */
export const auth = (): Auth => {
  if (!authInstance) {
    try {
      authInstance = getAuth(getFirebaseApp());
      logger.info("Firebase Auth instance created");
    } catch (error) {
      logger.error({ error }, "Failed to get Firebase Auth instance");
      throw new Error("Failed to initialize Firebase Auth.");
    }
  }
  return authInstance;
};

/**
 * Get Firestore instance
 */
export const db = (): Firestore => {
  if (!firestoreInstance) {
    getFirebaseApp();
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
};

/**
 * Get Storage instance
 */
export const storage = (): Storage => {
  if (!storageInstance) {
    getFirebaseApp();
    storageInstance = getStorage(app);
  }
  return storageInstance;
};

/**
 * Retry helper function
 */
async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn({ attempt, maxRetries, error: lastError }, "Retry attempt failed");

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Map Firebase error codes to user-friendly messages
 */
function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const errorCode = (error as any).code;

    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/too-many-requests":
        return "Too many requests. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/requires-recent-login":
        return "Please log in again to complete this action.";
      case "auth/invalid-credential":
        return "Invalid email or password.";
      default:
        return error.message || "An error occurred. Please try again.";
    }
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  try {
    const unsubscribe = onAuthStateChanged(auth(), (user) => {
      logger.info({ uid: user?.uid, email: user?.email }, "Auth state changed");
      callback(user);
    });

    return unsubscribe;
  } catch (error) {
    logger.error({ error }, "Failed to set up auth state listener");
    throw new Error("Failed to initialize auth state listener.");
  }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    logger.info({ email }, "Attempting login");

    const result = await retry(
      () => signInWithEmailAndPassword(auth(), email, password),
      3,
      1000
    );

    logger.info({ uid: result.user.uid, email }, "Login successful");
    return result.user;
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    logger.error({ error, email }, "Login failed");
    throw new Error(errorMessage);
  }
}

/**
 * Register with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  try {
    logger.info({ email, displayName }, "Attempting registration");

    const result = await retry(
      () => createUserWithEmailAndPassword(auth(), email, password),
      3,
      1000
    );

    // Update display name if provided
    if (displayName && result.user) {
      try {
        await result.user.updateProfile({ displayName });
        logger.info({ uid: result.user.uid }, "Display name updated");
      } catch (updateError) {
        logger.warn({ error: updateError }, "Failed to update display name");
        // Don't throw - registration succeeded even if display name update fails
      }
    }

    logger.info({ uid: result.user.uid, email }, "Registration successful");
    return result.user;
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    logger.error({ error, email }, "Registration failed");
    throw new Error(errorMessage);
  }
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  try {
    logger.info("Attempting sign out");
    await retry(() => firebaseSignOut(auth()), 2, 500);
    logger.info("Sign out successful");
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    logger.error({ error }, "Sign out failed");
    throw new Error(errorMessage);
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    logger.info({ email }, "Sending password reset email");

    await retry(
      () => sendPasswordResetEmail(auth(), email),
      3,
      1000
    );

    logger.info({ email }, "Password reset email sent");
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    logger.error({ error, email }, "Failed to send password reset email");
    throw new Error(errorMessage);
  }
}

/**
 * Send email verification
 */
export async function sendEmailVerification(user: User): Promise<void> {
  try {
    if (user.emailVerified) {
      logger.info({ uid: user.uid }, "Email already verified");
      return;
    }

    logger.info({ uid: user.uid, email: user.email }, "Sending email verification");

    await retry(
      () => firebaseSendEmailVerification(user),
      3,
      1000
    );

    logger.info({ uid: user.uid }, "Email verification sent");
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    logger.error({ error, uid: user.uid }, "Failed to send email verification");
    throw new Error(errorMessage);
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(
  user: User,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    logger.info({ uid: user.uid }, "Updating password");

    // Re-authenticate user first
    if (!user.email) {
      throw new Error("User email is required for password update");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await retry(
      () => reauthenticateWithCredential(user, credential),
      2,
      500
    );

    // Update password
    await retry(
      () => updatePassword(user, newPassword),
      2,
      500
    );

    logger.info({ uid: user.uid }, "Password updated successfully");
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    logger.error({ error, uid: user.uid }, "Failed to update password");
    throw new Error(errorMessage);
  }
}
