"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { env } from "@/lib/env";

interface AgentProviderProps {
  children: React.ReactNode;
}

export function AgentProvider({ children }: AgentProviderProps) {
  return (
    <CopilotKit
      runtimeUrl={env.AGENT_BASE_URL}
      publicApiKey={process.env.NEXT_PUBLIC_COPILOTKIT_API_KEY}
    >
      <CopilotSidebar>
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}

