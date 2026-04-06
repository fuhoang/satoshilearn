"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

import { MessageBubble } from "@/components/chat/MessageBubble";
import { Card } from "@/components/ui/Card";

const GUEST_LIMIT_ERROR =
  "You have used the guest AI demo for now. Log in to keep chatting.";

export function ChatWindow({
  className,
  initialUsage,
  starterPrompts = [],
  requestSource,
  submittedPrompt,
  submittedPromptVersion,
  onClose,
}: {
  className?: string;
  initialUsage?: {
    limit: number;
    plan: "free" | "pro";
    remaining: number;
    resetAt: number;
  } | null;
  starterPrompts?: readonly string[];
  requestSource?: "home" | "lesson";
  submittedPrompt?: string;
  submittedPromptVersion?: number;
  onClose?: () => void;
}) {
  const { messages, isLoading, error, sendMessage, usage } = useChat(
    [],
    {
      initialUsage,
      source: requestSource,
    },
  );
  const lastSubmittedPromptVersion = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isHomeChat = requestSource === "home";
  const hasUserMessages = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );
  const isGuestLimitReached =
    isHomeChat &&
    (
      (usage?.plan === "free" && usage.remaining <= 0) ||
      error === GUEST_LIMIT_ERROR
    );

  function submitStarter(prompt: string) {
    if (isLoading || isGuestLimitReached) {
      return;
    }

    void sendMessage(prompt);
  }

  useEffect(() => {
    if (
      !submittedPrompt?.trim() ||
      !submittedPromptVersion ||
      submittedPromptVersion === lastSubmittedPromptVersion.current
    ) {
      return;
    }

    lastSubmittedPromptVersion.current = submittedPromptVersion;
    void sendMessage(submittedPrompt);
  }, [sendMessage, submittedPrompt, submittedPromptVersion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [isLoading, messages]);

  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-t-[1.25rem] rounded-b-none !border-x-white/10 !border-t-white/10 !border-b-0 !bg-black/70 bg-none p-5 text-white shadow-none backdrop-blur-md sm:p-6",
        className,
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        {usage ? (
          <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
            {usage.plan === "pro"
              ? `Pro account · ${usage.remaining} of ${usage.limit} tutor questions left today`
              : requestSource === "home"
                ? usage.limit <= 3
                  ? `Guest demo · ${usage.remaining} of ${usage.limit} questions left`
                  : `Free account · ${usage.remaining} of ${usage.limit} tutor questions left today`
                : `Free account · ${usage.remaining} of ${usage.limit} tutor questions left today`}
          </div>
        ) : <div className="flex-1" />}
        {onClose ? (
          <button
            aria-label="Close conversation"
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-orange-400/40 bg-orange-500 p-0 text-[10px] leading-none text-black transition-colors hover:bg-orange-400"
            type="button"
            onClick={onClose}
          >
            <span className="leading-none">×</span>
          </button>
        ) : null}
      </div>
      <div className="mb-2 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-2">
        {isHomeChat && !hasUserMessages ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 text-left">
            <p className="text-sm font-semibold text-white">
              Start with a simple question
            </p>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Use the demo to understand Bitcoin, wallets, and basic crypto concepts
              before you create an account.
            </p>
            <p className="mt-2 text-xs leading-6 text-zinc-500">
              Safety tip: never share a private key, password, or recovery phrase in
              chat.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-orange-100"
                  type="button"
                  onClick={() => submitStarter(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
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
        {isGuestLimitReached ? (
          <div className="max-w-[85%] rounded-[1.75rem] border border-orange-400/20 bg-orange-500/10 p-5 text-left">
            <p className="text-sm font-semibold text-orange-100">
              Your guest demo is complete
            </p>
            <p className="mt-2 text-sm leading-7 text-orange-50/85">
              Create an account or log in to keep chatting, save your progress, and
              unlock the full tutor experience.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400"
                href="/auth/register"
              >
                Create free account
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                href="/auth/login"
              >
                Log in
              </Link>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
    </Card>
  );
}
