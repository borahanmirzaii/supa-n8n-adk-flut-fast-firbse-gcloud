import { z } from "zod";

// User schemas
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
});

// Project schemas
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  ownerId: z.string(),
  memberIds: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  memberIds: z.array(z.string()).optional().default([]),
});

// Task schemas
export const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["todo", "doing", "done"]),
  assigneeId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createTaskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  assigneeId: z.string(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  assigneeId: z.string().optional(),
});

// Message schemas
export const messageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.enum(["user", "assistant", "tool"]),
  content: z.string(),
  createdAt: z.date(),
});

export const createMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1),
  role: z.enum(["user", "assistant", "tool"]).optional().default("user"),
});

// Agent session schemas
export const agentSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  lastMessageAt: z.date(),
});

export const createAgentSessionSchema = z.object({
  userId: z.string(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Message = z.infer<typeof messageSchema>;
export type AgentSession = z.infer<typeof agentSessionSchema>;

