/**
 * Agent configuration types
 */

export enum AgentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
}

export enum AgentType {
  CHAT = "chat",
  TASK = "task",
  WORKFLOW = "workflow",
  CUSTOM = "custom",
}

export interface AgentConfig {
  name: string;
  description?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  tools: string[];
  metadata?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  config: AgentConfig;
  status: AgentStatus;
  type: AgentType;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version?: string;
}

export interface AgentCreateInput {
  config: AgentConfig;
  status?: AgentStatus;
  type?: AgentType;
}

export interface AgentUpdateInput {
  config?: Partial<AgentConfig>;
  status?: AgentStatus;
}

export interface AgentResponse {
  agent: Agent;
  metrics?: AgentMetrics;
}

export interface AgentMetrics {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  lastUsedAt?: Date;
}



