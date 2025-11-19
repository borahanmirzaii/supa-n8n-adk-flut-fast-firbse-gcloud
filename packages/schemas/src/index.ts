import { z } from "zod";

// Re-export all schemas from individual files
export * from "./user.schema";
export * from "./agent.schema";
export * from "./message.schema";
export * from "./auth.schema";

// Legacy project and task schemas for backward compatibility
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

export const agentSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  lastMessageAt: z.date(),
});

export const createAgentSessionSchema = z.object({
  userId: z.string(),
});

// Legacy type exports
export type Project = z.infer<typeof projectSchema>;
export type Task = z.infer<typeof taskSchema>;
export type AgentSession = z.infer<typeof agentSessionSchema>;
