import { z } from "zod";

/**
 * Agent configuration validation schemas
 */

export const agentStatusSchema = z.enum(["active", "inactive", "archived"]);
export const agentTypeSchema = z.enum(["chat", "task", "workflow", "custom"]);

export const agentConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(1).max(4096).optional(),
  tools: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export const agentSchema = z.object({
  id: z.string(),
  config: agentConfigSchema,
  status: agentStatusSchema,
  type: agentTypeSchema.default("chat"),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  version: z.string().optional(),
});

export const createAgentSchema = z.object({
  config: agentConfigSchema,
  status: agentStatusSchema.optional(),
  type: agentTypeSchema.optional(),
});

export const updateAgentSchema = z.object({
  config: agentConfigSchema.partial().optional(),
  status: agentStatusSchema.optional(),
});

export const agentMetricsSchema = z.object({
  totalRequests: z.number().int().default(0),
  averageResponseTime: z.number().default(0),
  successRate: z.number().min(0).max(1).default(0),
  lastUsedAt: z.date().optional(),
});

// Type exports
export type AgentConfig = z.infer<typeof agentConfigSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type AgentType = z.infer<typeof agentTypeSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type AgentMetrics = z.infer<typeof agentMetricsSchema>;



