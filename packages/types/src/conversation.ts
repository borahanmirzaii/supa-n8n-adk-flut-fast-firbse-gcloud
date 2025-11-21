/**
 * Message and conversation types
 */

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  TOOL = "tool",
  SYSTEM = "system",
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: "image" | "file" | "link";
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId?: string;
  title?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ConversationSession {
  id: string;
  userId: string;
  agentId?: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  metadata?: Record<string, unknown>;
}

export interface MessageCreateInput {
  sessionId: string;
  content: string;
  role?: MessageRole;
  metadata?: Record<string, unknown>;
  attachments?: MessageAttachment[];
}

export interface ConversationCreateInput {
  userId: string;
  agentId?: string;
  title?: string;
  metadata?: Record<string, unknown>;
}



