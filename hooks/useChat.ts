"use client";

import { useCallback, useState } from "react";

import { useLearningHistory } from "@/hooks/useLearningHistory";
import { getApiErrorMessage, getNetworkErrorMessage } from "@/lib/client-api";
import type { ChatMessage } from "@/types/chat";

type TutorUsage = {
  limit: number;
  plan: "free" | "pro";
  remaining: number;
  resetAt: number;
};

type UseChatOptions = {
  initialUsage?: TutorUsage | null;
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
  const [usage, setUsage] = useState<TutorUsage | null>(options.initialUsage ?? null);
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

      const data = (await response.clone().json().catch(() => null)) as {
        error?: string;
        reply?: string;
        recordedAt?: string;
        topic?: string;
        usage?: TutorUsage;
      } | null;

      if (data?.usage) {
        setUsage(data.usage);
      }

      if (!response.ok || !data?.reply) {
        throw new Error(await getApiErrorMessage(response, {
          badRequestMessage: "Please enter a clear tutor question and try again.",
          fallbackMessage: "Unable to get a tutor response right now.",
          networkMessage:
            "We couldn't reach the tutor right now. Please try again shortly.",
          rateLimitMessage:
            "The tutor is busy right now. Please wait a minute and try again.",
          unauthorizedMessage:
            options.source === "home"
              ? "Log in to keep chatting with the AI tutor."
              : "Log in to use the AI tutor.",
          unavailableMessage:
            "The tutor is temporarily unavailable. Please try again shortly.",
        }));
      }

      const reply = data.reply;

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
          : getNetworkErrorMessage({
            fallbackMessage: "Unable to get a tutor response right now.",
            networkMessage:
              "We couldn't reach the tutor right now. Please try again shortly.",
            unavailableMessage:
              "The tutor is temporarily unavailable. Please try again shortly.",
          });

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [options.source, recordTutorPrompt]);

  return { messages, isLoading, error, sendMessage, usage };
}
