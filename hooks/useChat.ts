"use client";

import { useCallback, useState } from "react";

import { useLearningHistory } from "@/hooks/useLearningHistory";
import type { ChatMessage } from "@/types/chat";

type TutorUsage = {
  limit: number;
  plan: "free" | "pro";
  remaining: number;
  resetAt: number;
};

type UseChatOptions = {
  source?: "home" | "lesson";
};

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Ask anything about Bitcoin and I will explain it with simple language and concrete examples.",
};

export function useChat(
  initialMessages: ChatMessage[] = [welcomeMessage],
  options: UseChatOptions = {},
) {
  const [messages, setMessages] = useState<ChatMessage[]>([...initialMessages]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<TutorUsage | null>(null);
  const { recordTutorPrompt } = useLearningHistory();

  const sendMessage = useCallback(async (content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    const timestamp = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${timestamp}`,
      role: "user",
      content: trimmedContent,
    };

    setMessages((current) => [...current, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedContent,
          source: options.source ?? "lesson",
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        reply?: string;
        recordedAt?: string;
        topic?: string;
        usage?: TutorUsage;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Unable to get a tutor response right now.");
      }

      const reply = data.reply;
      setUsage(data.usage ?? null);

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${timestamp + 1}`,
          role: "assistant",
          content: reply,
        },
      ]);
      recordTutorPrompt(trimmedContent, {
        repliedAt: data.recordedAt,
        responsePreview: reply.slice(0, 160),
        topic: data.topic ?? null,
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to get a tutor response right now.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [options.source, recordTutorPrompt]);

  return { messages, isLoading, error, sendMessage, usage };
}
