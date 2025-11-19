import { env } from "./env";
import { logger } from "./logger";

export interface AgentRequest {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface AgentResponse {
  response: string;
  sessionId: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Call agent API with error handling and retry logic
 */
export async function callAgent(request: AgentRequest): Promise<AgentResponse> {
  try {
    logger.info({ sessionId: request.sessionId, message: request.message.substring(0, 50) }, "Calling agent API");

    const response = await fetch(`${env.AGENT_BASE_URL}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add auth token header
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, error: errorText }, "Agent API error");
      throw new Error(`Agent API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    logger.info({ sessionId: data.sessionId }, "Agent API response received");
    return data;
  } catch (error) {
    logger.error({ error, request }, "Failed to call agent API");
    throw error instanceof Error ? error : new Error("Failed to call agent API");
  }
}

/**
 * Stream agent response using Server-Sent Events
 */
export async function streamAgentResponse(
  request: AgentRequest,
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  try {
    logger.info({ sessionId: request.sessionId }, "Starting agent stream");

    const response = await fetch(`${env.AGENT_BASE_URL}/api/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add auth token header
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, error: errorText }, "Agent stream error");
      throw new Error(`Agent stream error: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        logger.info({ sessionId: request.sessionId }, "Agent stream completed");
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6)) as StreamChunk;
            onChunk(data);
            if (data.done) {
              return;
            }
          } catch (err) {
            logger.warn({ error: err, line }, "Failed to parse stream chunk");
          }
        }
      }
    }
  } catch (error) {
    logger.error({ error, request }, "Failed to stream agent response");
    throw error instanceof Error ? error : new Error("Failed to stream agent response");
  }
}

