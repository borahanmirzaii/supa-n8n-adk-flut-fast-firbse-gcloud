import { z } from "zod";

/**
 * Message validation schemas
 */

export const messageRoleSchema = z.enum(["user", "assistant", "tool", "system"]);

export const messageAttachmentSchema = z.object({
  type: z.enum(["image", "file", "link"]),
  url: z.string().url(),
  name: z.string().optional(),
  size: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
});

export const messageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: messageRoleSchema,
  content: z.string().min(1),
  createdAt: z.date(),
  metadata: z.record(z.unknown()).optional(),
  attachments: z.array(messageAttachmentSchema).optional(),
});

export const createMessageSchema = z.object({
  sessionId: z.string().min(1),
  content: z.string().min(1),
  role: messageRoleSchema.optional().default("user"),
  metadata: z.record(z.unknown()).optional(),
  attachments: z.array(messageAttachmentSchema).optional(),
});

export const conversationSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  agentId: z.string().optional(),
  createdAt: z.date(),
  lastMessageAt: z.date(),
  messageCount: z.number().int().default(0),
  metadata: z.record(z.unknown()).optional(),
});

export const createConversationSchema = z.object({
  userId: z.string().min(1),
  agentId: z.string().optional(),
  title: z.string().max(200).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Type exports
export type Message = z.infer<typeof messageSchema>;
export type MessageRole = z.infer<typeof messageRoleSchema>;
export type MessageAttachment = z.infer<typeof messageAttachmentSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type ConversationSession = z.infer<typeof conversationSessionSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;



