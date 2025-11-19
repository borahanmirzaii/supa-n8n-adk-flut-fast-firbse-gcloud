/**
 * Real-time Firestore query hook with TanStack Query
 */

"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { collection, query, where, orderBy, limit, onSnapshot, type QueryConstraint } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/client";
import { logger } from "../logger";

interface UseFirestoreQueryOptions<T> {
  collectionPath: string;
  constraints?: QueryConstraint[];
  enabled?: boolean;
  select?: (data: T[]) => T[];
}

export function useFirestoreQuery<T = Record<string, unknown>>(
  options: UseFirestoreQueryOptions<T>,
  queryOptions?: Omit<UseQueryOptions<T[], Error>, "queryKey" | "queryFn">
) {
  const { collectionPath, constraints = [], enabled = true, select } = options;
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    logger.info({ collectionPath }, "Setting up Firestore query");

    try {
      let q = query(collection(db(), collectionPath), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: T[] = [];
          snapshot.forEach((doc) => {
            docs.push({ id: doc.id, ...doc.data() } as T);
          });

          const processedData = select ? select(docs) : docs;
          setData(processedData);
          setError(null);
          setIsLoading(false);
          logger.info({ collectionPath, count: docs.length }, "Firestore query updated");
        },
        (err) => {
          logger.error({ error: err, collectionPath }, "Firestore query error");
          setError(err);
          setIsLoading(false);
        }
      );

      return () => {
        logger.info({ collectionPath }, "Unsubscribing from Firestore query");
        unsubscribe();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({ error, collectionPath }, "Failed to setup Firestore query");
      setError(error);
      setIsLoading(false);
    }
  }, [collectionPath, enabled, JSON.stringify(constraints), select]);

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
  };
}

/**
 * Query messages for a session
 */
export function useMessagesQuery(sessionId: string | null, messageLimit: number = 50) {
  return useFirestoreQuery(
    {
      collectionPath: `agents-sessions/${sessionId}/messages`,
      constraints: [
        orderBy("createdAt", "desc"),
        limit(messageLimit),
      ],
      enabled: !!sessionId,
    },
    {
      select: (data) => data.reverse(), // Reverse to get chronological order
    }
  );
}

/**
 * Query user sessions
 */
export function useSessionsQuery(userId: string | null, limitCount: number = 20) {
  return useFirestoreQuery(
    {
      collectionPath: "agents-sessions",
      constraints: [
        where("userId", "==", userId || ""),
        orderBy("lastMessageAt", "desc"),
        limit(limitCount),
      ],
      enabled: !!userId,
    }
  );
}

