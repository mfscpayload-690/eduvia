"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowUpRight, Loader2, Sparkles, RefreshCw, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { ChatMessage } from "@/lib/types";

const INITIAL_ASSISTANT = "Hi! I'm eduvia AI. Ask me about schedules, notes, events, or general study help.";

export default function EduviaAIPage() {
  const { status } = useSession();
  const [history, setHistory] = useState<ChatMessage[]>([{ role: "assistant", content: INITIAL_ASSISTANT }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const send = async () => {
    const message = input.trim();
    if (!message || sending) return;

    setInput("");
    setSending(true);
    setError(null);
    setHistory((h) => [...h, { role: "user", content: message }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to chat");

      setHistory((h) => [...h, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setHistory((h) => [
        ...h,
        { role: "assistant", content: `Sorry, I hit an issue: ${e?.message || "Unknown error"}` },
      ]);
      setError(e?.message || "Failed to chat");
    } finally {
      setSending(false);
    }
  };

  const resetChat = () => {
    setHistory([{ role: "assistant", content: INITIAL_ASSISTANT }]);
    setError(null);
    setInput("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-neutral-800 bg-neutral-900/80 backdrop-blur">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/20 text-blue-200 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Sign in to chat with eduvia AI</p>
                <p className="text-sm text-neutral-400">Access the full-screen assistant experience once authenticated.</p>
              </div>
            </div>
            <Link href="/auth/signin">
              <Button className="w-full">Go to sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:py-12">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300">eduvia-ai</p>
              <h1 className="text-3xl font-semibold leading-tight">Ask eduvia anything</h1>
              <p className="text-neutral-400 text-sm">Deep answers on notes, timetable, events, and study help — full screen.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-neutral-800 text-neutral-200" onClick={resetChat}>
              <RefreshCw className="h-4 w-4 mr-2" /> New chat
            </Button>
            <Link href="/notes">
              <Button variant="outline" className="border-neutral-800 text-neutral-200">
                Notes <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-neutral-800 bg-neutral-900/60 backdrop-blur">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-[1fr_320px] gap-0 lg:gap-6">
              <div className="flex flex-col h-[70vh] md:h-[75vh]">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {history.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[92%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed border ${
                          m.role === "user"
                            ? "bg-blue-600 text-white border-blue-500/40"
                            : "bg-neutral-800 text-neutral-100 border-neutral-700"
                        }`}
                      >
                        {m.role === "assistant" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                              code: ({ children }) => (
                                <code className="bg-neutral-900/70 px-1.5 py-0.5 rounded text-xs border border-neutral-700">{children}</code>
                              ),
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <div className="border-t border-neutral-800 bg-neutral-900/70 p-3 md:p-4">
                  {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
                  <div className="flex items-center gap-3">
                    <textarea
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (canSend) send();
                        }
                      }}
                      placeholder="Ask about notes, timetable, events, or any study question..."
                      className="flex-1 resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button onClick={send} disabled={!canSend} className="px-4">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex flex-col border-l border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 text-blue-200 flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Pro tips</p>
                    <p className="text-sm text-neutral-400">Try these to get better answers</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    "Summarize notes for PBCS304",
                    "Create a study plan for next 7 days",
                    "List upcoming events this week",
                    "Explain binary search with a dry run",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="w-full text-left rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:border-blue-500/60 hover:text-white transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-neutral-500 border border-neutral-800 rounded-lg p-3 bg-neutral-900/60">
                  Need the small floating chat? It stays available across the app — use it anytime.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
