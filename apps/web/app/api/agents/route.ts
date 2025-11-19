import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    logger.info({ body }, "Agent request received");

    const res = await fetch(`${env.AGENT_BASE_URL}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      logger.error({ status: res.status, statusText: res.statusText }, "Agent API error");
      return NextResponse.json(
        { error: "Agent API error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error({ error }, "Error calling agent");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

