// Shared TypeScript type definitions

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "tool";
  content: string;
  createdAt: Date;
}

