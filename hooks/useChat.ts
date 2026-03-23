"use client";

import { useCallback, useState } from "react";

import type { ChatMessage } from "@/types/chat";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Ask anything about Bitcoin and I will explain it with simple language and concrete examples.",
};

export function useChat(initialMessages: ChatMessage[] = [welcomeMessage]) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    ...initialMessages,
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });

      const data = (await response.json()) as { reply: string };

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, isLoading, sendMessage };
}
