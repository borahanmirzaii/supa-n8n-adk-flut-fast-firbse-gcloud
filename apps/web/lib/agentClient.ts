import { env } from "./env";

export interface AgentRequest {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface AgentResponse {
  response: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export async function callAgent(request: AgentRequest): Promise<AgentResponse> {
  const response = await fetch(`${env.AGENT_BASE_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Agent API error: ${response.statusText}`);
  }

  return response.json();
}

