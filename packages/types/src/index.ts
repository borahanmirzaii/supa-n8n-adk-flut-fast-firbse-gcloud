// Shared TypeScript type definitions
// Re-export all types from individual files

export * from "./user";
export * from "./agent";
export * from "./conversation";
export * from "./api";
export * from "./firebase";

// Legacy exports for backward compatibility
export interface Project {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  assigneeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSession {
  id: string;
  userId: string;
  createdAt: Date;
  lastMessageAt: Date;
}

