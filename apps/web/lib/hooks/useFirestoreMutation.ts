/**
 * Firestore mutation hook with TanStack Query
 */

"use client";

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { logger } from "../logger";
import toast from "react-hot-toast";

interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Create document mutation
 */
export function useCreateDocument<T = DocumentData>(
  collectionPath: string,
  options?: MutationOptions<{ id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<T, "id" | "createdAt" | "updatedAt">) => {
      logger.info({ collectionPath, data }, "Creating document");
      const docRef = await addDoc(collection(db(), collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as DocumentData);

      logger.info({ collectionPath, id: docRef.id }, "Document created");
      return { id: docRef.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [collectionPath] });
      if (options?.showToast && options?.successMessage) {
        toast.success(options.successMessage);
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      logger.error({ error, collectionPath }, "Failed to create document");
      if (options?.showToast) {
        toast.error(options?.errorMessage || "Failed to create document");
      }
      options?.onError?.(error);
    },
  });
}

/**
 * Update document mutation
 */
export function useUpdateDocument<T = DocumentData>(
  collectionPath: string,
  options?: MutationOptions<void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      logger.info({ collectionPath, id, data }, "Updating document");
      await updateDoc(doc(db(), collectionPath, id), {
        ...data,
        updatedAt: serverTimestamp(),
      } as DocumentData);

      logger.info({ collectionPath, id }, "Document updated");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collectionPath] });
      if (options?.showToast && options?.successMessage) {
        toast.success(options.successMessage);
      }
      options?.onSuccess?.(undefined);
    },
    onError: (error: Error) => {
      logger.error({ error, collectionPath }, "Failed to update document");
      if (options?.showToast) {
        toast.error(options?.errorMessage || "Failed to update document");
      }
      options?.onError?.(error);
    },
  });
}

/**
 * Delete document mutation
 */
export function useDeleteDocument(
  collectionPath: string,
  options?: MutationOptions<void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.info({ collectionPath, id }, "Deleting document");
      await deleteDoc(doc(db(), collectionPath, id));
      logger.info({ collectionPath, id }, "Document deleted");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [collectionPath] });
      if (options?.showToast && options?.successMessage) {
        toast.success(options.successMessage);
      }
      options?.onSuccess?.(undefined);
    },
    onError: (error: Error) => {
      logger.error({ error, collectionPath }, "Failed to delete document");
      if (options?.showToast) {
        toast.error(options?.errorMessage || "Failed to delete document");
      }
      options?.onError?.(error);
    },
  });
}

/**
 * Create message mutation
 */
export function useCreateMessage(sessionId: string) {
  return useCreateDocument(`agents-sessions/${sessionId}/messages`, {
    showToast: false,
  });
}



