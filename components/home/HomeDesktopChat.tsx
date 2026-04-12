"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

import { HomeChatComposer } from "@/components/home/HomeChatComposer";
import type { HomeChatUsage } from "@/components/home/homeChatTypes";

const ChatWindow = dynamic(
  () => import("@/components/chat/ChatWindow").then((module) => module.ChatWindow),
  { ssr: false },
);

type HomeDesktopChatProps = {
  chatStarterPrompts: readonly string[];
  composerStarterPrompts: readonly string[];
  initialUsage: HomeChatUsage;
  isChatOpen: boolean;
  onClose: () => void;
  onPromptChange: (value: string) => void;
  onSubmit: (prompt?: string) => void;
  panelHeight: number;
  prompt: string;
  submittedPrompt: string;
  submittedPromptVersion: number;
};

export function HomeDesktopChat({
  chatStarterPrompts,
  composerStarterPrompts,
  initialUsage,
  isChatOpen,
  onClose,
  onPromptChange,
  onSubmit,
  panelHeight,
  prompt,
  submittedPrompt,
  submittedPromptVersion,
}: HomeDesktopChatProps) {
  return (
    <>
      {isChatOpen ? (
        <div className="pointer-events-none absolute right-0 bottom-full left-0 z-20 translate-y-0 opacity-100 transition-all duration-300 ease-out">
          <div
            className="pointer-events-auto flex h-[var(--panel-height)] flex-col rounded-t-[1.5rem] rounded-b-none border-x border-t border-b-0 border-white/10 bg-transparent px-1 pt-0 pb-0 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
            style={{ "--panel-height": `${panelHeight}px` } as CSSProperties}
          >
            <ChatWindow
              className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-[1.25rem] rounded-b-none border border-b-0 border-white/10 bg-black/70"
              initialUsage={initialUsage}
              requestSource="home"
              starterPrompts={chatStarterPrompts}
              submittedPrompt={submittedPrompt}
              submittedPromptVersion={submittedPromptVersion}
              onClose={onClose}
            />
          </div>
        </div>
      ) : null}

      <div className="w-full rounded-none border border-white/10 bg-zinc-900/80 p-5 backdrop-blur">
        <HomeChatComposer
          onPromptChange={onPromptChange}
          onSubmit={onSubmit}
          prompt={prompt}
          starters={composerStarterPrompts}
          starterKeyPrefix="desktop"
        />
      </div>
    </>
  );
}
