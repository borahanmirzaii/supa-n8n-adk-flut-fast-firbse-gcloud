/**
 * Firebase document types
 */

import type { Timestamp } from "firebase/firestore";

/**
 * Base document interface with common Firestore fields
 */
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * Firestore user document
 */
export interface FirestoreUser extends FirestoreDocument {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role?: string;
}

/**
 * Firestore project document
 */
export interface FirestoreProject extends FirestoreDocument {
  name: string;
  ownerId: string;
  memberIds: string[];
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Firestore task document
 */
export interface FirestoreTask extends FirestoreDocument {
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  assigneeId: string;
  dueDate?: Timestamp | Date;
  priority?: "low" | "medium" | "high";
}

/**
 * Firestore agent session document
 */
export interface FirestoreAgentSession extends FirestoreDocument {
  userId: string;
  agentId?: string;
  lastMessageAt: Timestamp | Date;
  messageCount: number;
  metadata?: Record<string, unknown>;
}

/**
 * Firestore message document
 */
export interface FirestoreMessage extends FirestoreDocument {
  sessionId: string;
  role: "user" | "assistant" | "tool";
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * Firestore agent document
 */
export interface FirestoreAgent extends FirestoreDocument {
  config: Record<string, unknown>;
  status: "active" | "inactive" | "archived";
  createdBy: string;
  version?: string;
}



