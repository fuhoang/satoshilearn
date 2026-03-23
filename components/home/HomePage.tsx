"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { SoftAurora } from "@/components/home/SoftAurora";

const MODULES = [
  {
    title: "Bitcoin Basics",
    description: "Understand what Bitcoin is, why it exists, and why it matters.",
    eyebrow: "Start here",
    accent: "from-amber-400/25 via-orange-500/10 to-transparent",
    border: "border-amber-400/25",
    cta: "Explore basics",
    href: "/learn",
  },
  {
    title: "Wallets & Security",
    description: "Learn self-custody, scams, and safe first steps.",
    eyebrow: "Stay safe",
    accent: "from-emerald-400/25 via-cyan-500/10 to-transparent",
    border: "border-emerald-400/25",
    cta: "Learn security",
    href: "/learn",
  },
  {
    title: "Transactions & Mining",
    description: "Learn how Bitcoin moves and how the network stays secure.",
    eyebrow: "Go deeper",
    accent: "from-sky-400/25 via-indigo-500/10 to-transparent",
    border: "border-sky-400/25",
    cta: "See the network",
    href: "/learn",
  },
] as const;

const PRICING_PLANS = [
  {
    name: "Monthly plan",
    price: "GBP12",
    cadence: "/month",
    description:
      "Full curriculum, more AI usage, quizzes, progress tracking, and deeper security lessons.",
    footnote: null,
  },
  {
    name: "Yearly plan",
    price: "GBP120",
    cadence: "/year",
    description:
      "Full curriculum, more AI usage, quizzes, progress tracking, and deeper security lessons with a fixed annual price.",
    footnote: "Save compared with the monthly plan.",
  },
] as const;

export default function HomePage() {
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

    const demoNode: HTMLDivElement = demoElement;
    const headerNode: HTMLElement = headerElement;

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
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <section className="relative overflow-visible">
        <SoftAurora />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-16 pt-18 text-center lg:pb-24 lg:pt-24">
          <div className="relative z-10 max-w-5xl">
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Learn Bitcoin the easy way.
            </h1>
            <p className="mt-5 text-base leading-8 text-zinc-400 sm:text-lg">
              Simple lessons. Clear explanations. Step by step.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/learn"
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
              >
                Start free
              </Link>
              <Link
                href="/#curriculum"
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                View curriculum
              </Link>
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
                isChatOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <div
                className="pointer-events-auto rounded-t-[1.5rem] rounded-b-none border-x border-t border-b-0 border-white/10 bg-transparent p-1 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
                style={{ height: `${panelHeight}px` }}
              >
                <ChatWindow
                  className="flex h-full flex-col overflow-hidden border border-white/10 bg-black"
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
                  placeholder="Ask anything about bitcoin..."
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
                  <p className="text-xs text-zinc-500">AI prompt</p>
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

      <section id="curriculum" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-zinc-500">Curriculum</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A clearer path into Bitcoin.
            </h2>
            <p className="mt-4 text-base leading-8 text-zinc-400">
              Start with the basics, move into security and transactions, and
              use AI prompts for deeper understanding.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {MODULES.map((module, index) => (
              <div
                key={module.title}
                className={`group relative flex h-full overflow-hidden rounded-[1.75rem] border bg-black p-6 text-left transition-transform duration-200 hover:-translate-y-1 ${module.border}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${module.accent} opacity-80 transition-opacity duration-200 group-hover:opacity-100`}
                />
                <div className="relative flex h-full flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400">Module 0{index + 1}</p>
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300">
                      {module.eyebrow}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">
                    {module.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {module.description}
                  </p>
                  <div className="mt-auto pt-6">
                    <Link
                      href={module.href}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black shadow-none transition hover:bg-orange-400"
                    >
                      {module.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm text-zinc-500">Why it matters</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for beginners who want clarity and safe guidance.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400">
              Most people do not need more noise. They need a trusted place to
              learn Bitcoin step by step, ask smart questions, and avoid common
              mistakes.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <p className="text-sm text-zinc-500">{plan.name}</p>
                <p className="mt-3 text-4xl font-semibold text-white">
                  {plan.price}
                  <span className="text-base font-normal text-zinc-400">
                    {plan.cadence}
                  </span>
                </p>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {plan.description}
                </p>
                <Link
                  href="/pricing"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                >
                  Buy Now
                </Link>
                {plan.footnote ? (
                  <p className="mt-3 text-center text-xs text-zinc-500">
                    {plan.footnote}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
