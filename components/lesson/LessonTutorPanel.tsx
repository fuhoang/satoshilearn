"use client";

import { useEffect, useRef, useState } from "react";

import { MessageBubble } from "@/components/chat/MessageBubble";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

export function LessonTutorPanel({
  isOpen,
  lessonTitle,
  onOpenChange,
}: {
  isOpen: boolean;
  lessonTitle: string;
  onOpenChange: (nextOpen: boolean) => void;
}) {
  const [draft, setDraft] = useState("");
  const { error, isLoading, messages, sendMessage, usage } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [error, isLoading, messages]);

  async function submitPrompt() {
    const nextPrompt = draft.trim();

    if (!nextPrompt) {
      return;
    }

    onOpenChange(true);
    setDraft("");
    await sendMessage(nextPrompt);
  }

  return (
    <>
      <button
        aria-expanded={isOpen}
        className={cn(
          "fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-2xl border border-r-0 border-white/10 bg-black/85 px-4 py-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:bg-black/95",
          isOpen && "pointer-events-none translate-x-3 opacity-0",
        )}
        data-testid="lesson-tutor-launcher"
        type="button"
        onClick={() => onOpenChange(true)}
      >
        <span className="block text-[11px] uppercase tracking-[0.2em] text-orange-300">
          AI tutor
        </span>
        <span className="mt-2 block text-sm font-semibold text-white">
          Open side chat
        </span>
      </button>

      <div
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-0 z-40 bg-black/35 transition-opacity duration-300 xl:bg-black/10",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onOpenChange(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-full max-w-[var(--lesson-tutor-width)] flex-col border-l border-white/10 bg-zinc-950 text-white shadow-[-24px_0_80px_rgba(0,0,0,0.45)] transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        data-testid="lesson-tutor-drawer"
      >
        <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Lesson tutor
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                Ask while you read
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
                This is a placeholder side panel for lesson questions. Ask follow-up
                questions about {lessonTitle} as you go.
              </p>
            </div>
            <button
              aria-label="Close tutor panel"
              className="rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Close
            </button>
          </div>
          {usage ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.16em] text-zinc-400">
              {usage.plan === "pro" ? "Pro plan" : "Free plan"} · {usage.remaining} of{" "}
              {usage.limit} tutor requests left today
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading ? (
              <div className="max-w-[85%] rounded-3xl border border-white/10 bg-black px-4 py-3 text-sm leading-7 text-white">
                Thinking...
              </div>
            ) : null}
            {error ? (
              <div className="max-w-[85%] rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-7 text-red-100">
                {error}
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/70 px-6 py-5">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <textarea
              className="min-h-28 w-full resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
              placeholder="Ask about this lesson..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={() => onOpenChange(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submitPrompt();
                }
              }}
            />
            <div className="mt-3 flex items-center justify-between border-t border-white/10 px-2 pt-3">
              <p className="text-xs text-zinc-500">
                Enter to send, Shift+Enter for a new line
              </p>
              <button
                className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!draft.trim() || isLoading}
                type="button"
                onClick={() => void submitPrompt()}
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
