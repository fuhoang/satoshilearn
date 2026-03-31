"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { SoftAurora } from "@/components/home/SoftAurora";
import { homePromptHighlights } from "@/components/home/homeData";

const ChatWindow = dynamic(
  () => import("@/components/chat/ChatWindow").then((module) => module.ChatWindow),
  { ssr: false },
);

export function HomeHeroSection() {
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [promptVersion, setPromptVersion] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(560);
  const demoRef = useRef<HTMLDivElement | null>(null);

  function openConversation() {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    setSubmittedPrompt(trimmedPrompt);
    setPromptVersion((current) => current + 1);
    setIsChatOpen(true);
    setPrompt("");
  }

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
      const availableHeight = demoRect.top - headerRect.bottom - 12;

      setPanelHeight(Math.max(240, Math.round(availableHeight)));
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-300">
            {homePromptHighlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>

        <div
          id="demo"
          ref={demoRef}
          className="relative z-10 mt-44 flex w-full max-w-4xl flex-col items-center"
        >
          <div
            aria-hidden={!isChatOpen}
            className={`pointer-events-none absolute inset-x-0 bottom-full z-20 mb-0 transition-all duration-300 ease-out ${
              isChatOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div
              className="pointer-events-auto rounded-t-[1.5rem] rounded-b-none border-x border-t border-b-0 border-white/10 bg-transparent p-1 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
              style={{ height: `${panelHeight}px` }}
            >
              <ChatWindow
                className="flex h-full flex-col overflow-hidden border border-white/10 bg-black"
                requestSource="home"
                submittedPrompt={submittedPrompt}
                submittedPromptVersion={promptVersion}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>

          <div className="w-full rounded-3xl border border-white/10 bg-zinc-900/80 p-5 backdrop-blur">
            <div className="rounded-[1.75rem] border border-white/10 bg-black/40 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <input
                className="w-full bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
                placeholder="Ask anything about crypto..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    openConversation();
                  }
                }}
              />
              <div className="mt-3 flex items-center justify-between border-t border-white/10 px-2 pt-3">
                <p className="text-xs text-zinc-500">
                  Try 3 demo questions before login
                </p>
                <button
                  className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-orange-400"
                  type="button"
                  onClick={openConversation}
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
