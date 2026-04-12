"use client";

import { useEffect, useRef, useState } from "react";

import { HomeDesktopChat } from "@/components/home/HomeDesktopChat";
import { HomeMobileChat } from "@/components/home/HomeMobileChat";
import { SoftAurora } from "@/components/home/SoftAurora";
import { homeHeroChatStarters, homeInChatStarters } from "@/components/home/homeData";

export function HomeHeroSection({
  currentPlanSlug = null,
  isAuthenticated = false,
}: {
  currentPlanSlug?: string | null;
  isAuthenticated?: boolean;
}) {
  const initialUsageResetAt = 0;
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [promptVersion, setPromptVersion] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [panelHeight, setPanelHeight] = useState(560);
  const demoRef = useRef<HTMLDivElement | null>(null);
  const initialUsage = currentPlanSlug
    ? {
      limit: 30,
      plan: "pro" as const,
      remaining: 30,
      resetAt: initialUsageResetAt,
    }
    : isAuthenticated
      ? {
        limit: 10,
        plan: "free" as const,
        remaining: 10,
        resetAt: initialUsageResetAt,
      }
      : {
        limit: 3,
        plan: "free" as const,
        remaining: 3,
        resetAt: initialUsageResetAt,
      };

  function openConversation(nextPrompt?: string) {
    const trimmedPrompt = (nextPrompt ?? prompt).trim();

    if (!trimmedPrompt) {
      return;
    }

    setSubmittedPrompt(trimmedPrompt);
    setPromptVersion((current) => current + 1);
    setIsChatOpen(true);
    setPrompt("");
  }

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    const demoElement = demoRef.current;
    const headerElement = document.querySelector<HTMLElement>("header");

    if (
      !(demoElement instanceof HTMLDivElement) ||
      !(headerElement instanceof HTMLElement)
    ) {
      return;
    }

    const demoNode = demoElement;
    const headerNode = headerElement;

    function syncPanelHeight() {
      const demoRect = demoNode.getBoundingClientRect();
      const headerRect = headerNode.getBoundingClientRect();
      const availableHeight = demoRect.top - headerRect.bottom;

      setPanelHeight(Math.max(260, Math.round(availableHeight)));
    }

    syncPanelHeight();

    const observer = new ResizeObserver(syncPanelHeight);
    observer.observe(demoNode);
    observer.observe(headerNode);
    window.addEventListener("resize", syncPanelHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncPanelHeight);
    };
  }, []);

  return (
    <section className="relative overflow-visible">
      <SoftAurora />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-16 pt-18 text-center lg:pb-24 lg:pt-24">
        <div className="relative z-10 max-w-5xl">
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Learn Crypto the easy way.
          </h1>
          <p className="mt-5 text-base leading-8 text-zinc-400 sm:text-lg">
            Simple lessons. Clear explanations. Step by step.
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.16em] text-zinc-500 sm:text-base">
            Bloquera — Learn crypto with clarity.
          </p>

        </div>

        <div
          id="demo"
          ref={demoRef}
          className="relative z-10 mt-20 w-full max-w-4xl md:mt-56"
        >
          {!isMobileViewport ? (
            <HomeDesktopChat
              chatStarterPrompts={homeInChatStarters}
              composerStarterPrompts={homeHeroChatStarters}
              initialUsage={initialUsage}
              isChatOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              onPromptChange={setPrompt}
              onSubmit={openConversation}
              panelHeight={panelHeight}
              prompt={prompt}
              submittedPrompt={submittedPrompt}
              submittedPromptVersion={promptVersion}
            />
          ) : null}
        </div>
      </div>

      {isMobileViewport ? (
        <HomeMobileChat
          chatStarterPrompts={homeInChatStarters}
          composerStarterPrompts={homeHeroChatStarters}
          initialUsage={initialUsage}
          isChatOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onPromptChange={setPrompt}
          onSubmit={openConversation}
          onToggle={() => setIsChatOpen((current) => !current)}
          prompt={prompt}
          submittedPrompt={submittedPrompt}
          submittedPromptVersion={promptVersion}
        />
      ) : null}
    </section>
  );
}
