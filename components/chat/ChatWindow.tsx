"use client";

import { useEffect, useMemo, useRef } from "react";

import { useChat } from "@/hooks/useChat";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

import { MessageBubble } from "@/components/chat/MessageBubble";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ChatWindow({
  className,
  submittedPrompt,
  submittedPromptVersion,
  onClose,
}: {
  className?: string;
  submittedPrompt?: string;
  submittedPromptVersion?: number;
  onClose?: () => void;
}) {
  const seededMessages = useMemo<ChatMessage[]>(
    () => [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Ask anything about Bitcoin and I will explain it with simple language and concrete examples.",
      },
    ],
    [],
  );
  const { messages, isLoading, sendMessage } = useChat(seededMessages);
  const lastSubmittedPromptVersion = useRef(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
        "flex h-full flex-col rounded-t-[1.25rem] rounded-b-none !border-x-white/10 !border-t-white/10 !border-b-0 !bg-black/70 bg-none p-7 text-white shadow-none backdrop-blur-md sm:p-8",
        className,
      )}
    >
      <div className="mb-7 flex items-center justify-end">
        {onClose ? (
          <Button
            aria-label="Close conversation"
            className="h-8 w-8 rounded-full border border-white/10 bg-black px-0 py-0 text-base text-white hover:bg-white/5"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            ×
          </Button>
        ) : null}
      </div>
      <div className="mb-2 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading ? (
          <div className="max-w-[85%] rounded-3xl border border-white/10 bg-black px-4 py-3 text-sm leading-7 text-white">
            Thinking...
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
    </Card>
  );
}
