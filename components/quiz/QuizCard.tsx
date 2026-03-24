"use client";

import { useState } from "react";

import type { QuizQuestion } from "@/types/quiz";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type QuizCardProps = {
  question?: QuizQuestion;
  index?: number;
  selected?: string | null;
  locked?: boolean;
  checked?: boolean;
  onSelect?: (answer: string) => void;
};

const dashboardFallback: QuizQuestion = {
  id: "dashboard-scarcity-check",
  prompt: "Which statement best explains Bitcoin scarcity?",
  options: [
    "Bitcoin is valuable because it is easy to create.",
    "Bitcoin is valuable because supply is predictable and verification is open.",
    "Bitcoin is valuable because banks can print more of it when demand rises.",
  ],
  correctAnswer:
    "Bitcoin is valuable because supply is predictable and verification is open.",
  explanation:
    "Scarcity matters because users can inspect the rules and trust that supply is not discretionary.",
};

export function QuizCard({
  question = dashboardFallback,
  index = 0,
  selected = null,
  locked = false,
  checked = false,
  onSelect,
}: QuizCardProps) {
  const [fallbackSelected, setFallbackSelected] = useState<string | null>(null);
  const activeSelected = onSelect ? selected : fallbackSelected;

  return (
    <Card className="border border-white/10 !bg-white/[0.03] p-6 text-white shadow-none">
      <p className="text-sm font-semibold text-zinc-500">
        Quick Check {index > 0 ? String(index).padStart(2, "0") : ""}
      </p>
      <h3 className="mt-2 text-xl font-bold text-white">{question.prompt}</h3>
      <div className="mt-5 space-y-3">
        {question.options.map((option) => {
          const isSelected = activeSelected === option;
          const isCorrect = option === question.correctAnswer;
          const showCorrect = checked && isCorrect;
          const showIncorrect = checked && isSelected && !isCorrect;

          return (
            <button
              key={option}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                showCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                  : showIncorrect
                    ? "border-red-500/40 bg-red-500/10 text-white"
                    : isSelected
                      ? "border-orange-500/40 bg-orange-500/10 text-white"
                      : "border-white/10 bg-black/40 text-zinc-300 hover:bg-white/[0.05]"
              } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
              disabled={locked}
              onClick={() => {
                if (onSelect) {
                  onSelect(option);
                  return;
                }

                setFallbackSelected(option);
              }}
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
      {checked ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm leading-7 text-zinc-300">{question.explanation}</p>
          {activeSelected && activeSelected !== question.correctAnswer && question.reviewHref ? (
            <LinkLike href={question.reviewHref}>
              {question.reviewLabel ?? "Review this section"}
            </LinkLike>
          ) : null}
        </div>
      ) : null}
      {!onSelect ? (
        <div className="mt-5">
          <Button
            className="w-full bg-orange-500 !text-black hover:bg-orange-400"
            variant="primary"
          >
            {activeSelected === question.correctAnswer
              ? "Correct answer selected"
              : "Select an answer"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function LinkLike({
  children,
  href,
}: {
  children: string;
  href: string;
}) {
  return (
    <a
      className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-zinc-300 transition hover:bg-white/5 hover:text-white"
      href={href}
    >
      {children}
    </a>
  );
}
