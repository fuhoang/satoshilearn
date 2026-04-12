"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

import { HomeChatComposer } from "@/components/home/HomeChatComposer";
import type { HomeChatUsage } from "@/components/home/homeChatTypes";

const ChatWindow = dynamic(
  () => import("@/components/chat/ChatWindow").then((module) => module.ChatWindow),
  { ssr: false },
);

type HomeMobileChatProps = {
  chatStarterPrompts: readonly string[];
  composerStarterPrompts: readonly string[];
  initialUsage: HomeChatUsage;
  isChatOpen: boolean;
  onClose: () => void;
  onPromptChange: (value: string) => void;
  onToggle: () => void;
  onSubmit: (prompt?: string) => void;
  prompt: string;
  submittedPrompt: string;
  submittedPromptVersion: number;
};

export function HomeMobileChat({
  chatStarterPrompts,
  composerStarterPrompts,
  initialUsage,
  isChatOpen,
  onClose,
  onPromptChange,
  onToggle,
  onSubmit,
  prompt,
  submittedPrompt,
  submittedPromptVersion,
}: HomeMobileChatProps) {
  useEffect(() => {
    if (!isChatOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 767px)");

    if (!mobileQuery.matches) {
      document.body.style.removeProperty("overflow");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isChatOpen]);

  return (
    <>
      {isChatOpen ? (
        <div
          id="home-mobile-chat"
          className="pointer-events-none fixed inset-0 z-40 translate-y-0 opacity-100 transition-all duration-300 ease-out md:hidden"
        >
          <div className="pointer-events-auto flex h-full flex-col bg-black/80 pt-20 backdrop-blur">
            <div className="flex h-full flex-col">
              <ChatWindow
                className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-[1.5rem] border-x border-t border-b-0 border-white/10 bg-black"
                initialUsage={initialUsage}
                requestSource="home"
                starterPrompts={chatStarterPrompts}
                submittedPrompt={submittedPrompt}
                submittedPromptVersion={submittedPromptVersion}
                onClose={onClose}
              />
              <div className="border-t border-white/10 bg-zinc-950/95 p-4">
                <HomeChatComposer
                  onPromptChange={onPromptChange}
                  onSubmit={onSubmit}
                  prompt={prompt}
                  starters={composerStarterPrompts}
                  starterKeyPrefix="mobile"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        aria-controls="home-mobile-chat"
        aria-expanded={isChatOpen}
        aria-label={isChatOpen ? "Close home chat" : "Open home chat"}
        className="fixed right-5 bottom-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-black shadow-[0_18px_45px_rgba(249,115,22,0.35)] transition hover:bg-orange-400 md:hidden"
        type="button"
        onClick={onToggle}
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M7 10.5h10M7 14.5h6M5 20l1.4-3.2A8 8 0 1 1 20 12a8 8 0 0 1-8 8H5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </>
  );
}
