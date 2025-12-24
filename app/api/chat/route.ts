import { NextResponse } from "next/server";
import { chatWithLLMStreaming } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import type { ChatMessage } from "@/lib/types";

export async function POST(req: Request) {
  try {
    await requireAuth();

    const body = await req.json();
    const { message, context, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Include history for better context
    const messages: ChatMessage[] = [
      ...history.slice(-5).map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    const stream = await chatWithLLMStreaming(messages, context);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("POST /api/chat error:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "LLM service not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}
