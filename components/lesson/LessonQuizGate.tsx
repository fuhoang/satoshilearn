"use client";

import { useMemo, useState } from "react";

import type { LessonMeta } from "@/types/lesson";
import type { QuizQuestion } from "@/types/quiz";

import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResult } from "@/components/quiz/QuizResult";
import { Button } from "@/components/ui/Button";
import { useLearningHistory } from "@/hooks/useLearningHistory";
import { useLessonProgress } from "@/hooks/useLessonProgress";

type LessonQuizGateProps = {
  lessonSlug: string;
  lessonTitle: string;
  questions: QuizQuestion[];
  previous: LessonMeta | null;
  next: LessonMeta | null;
};

export function LessonQuizGate({
  lessonSlug,
  lessonTitle,
  questions,
  previous,
  next,
}: LessonQuizGateProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const {
    isLessonCompleted,
    loaded,
    markLessonCompleted,
    retryLastSave,
    saveError,
    saveState,
  } = useLessonProgress();
  const { recordLessonCompleted, recordQuizAttempt } = useLearningHistory();
  const completed = isLessonCompleted(lessonSlug);
  const quizPassed = completed || passed;

  const correctCount = useMemo(
    () =>
      questions.filter((question) => answers[question.id] === question.correctAnswer)
        .length,
    [answers, questions],
  );

  const allAnswered = questions.every((question) => Boolean(answers[question.id]));

  function handleSelect(questionId: string, answer: string) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    setChecked(false);
    if (!completed) {
      setPassed(false);
    }
    setSkipped(false);
  }

  function handleCheckAnswers() {
    const minimumCorrect = Math.max(2, questions.length - 1);
    const allCorrect = correctCount >= minimumCorrect;

    setChecked(true);
    setPassed(allCorrect);
    setSkipped(false);
    recordQuizAttempt({
      lessonSlug,
      lessonTitle,
      correctCount,
      totalQuestions: questions.length,
      passed: allCorrect,
    });

    if (allCorrect) {
      markLessonCompleted(lessonSlug);
      recordLessonCompleted({
        lessonSlug,
        lessonTitle,
      });
    }
  }

  return (
    <div className="space-y-8">
      {quizPassed ? (
        <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Lesson complete
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            You can move on, or review the key ideas again.
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-200">
            {saveState === "error"
              ? "This lesson is complete here, but the save failed. Retry to keep it across refreshes and devices."
              : saveState === "saving"
                ? "Your progress is being saved now."
                : `Your progress has been saved${loaded ? " and synced." : "."}`}
          </p>
          {saveState === "error" ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                className="bg-white text-black hover:bg-zinc-200"
                onClick={retryLastSave}
                type="button"
                variant="secondary"
              >
                Retry save
              </Button>
              {saveError ? (
                <p className="text-sm text-red-200">{saveError}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Lesson quiz
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Finish the check, then decide whether to continue or review.
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Each lesson includes a short multiple-choice check. Pass the quiz to
            mark the lesson complete, or skip ahead and come back later.
          </p>
        </div>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <QuizCard
              key={question.id}
              checked={checked}
              index={index + 1}
              onSelect={(answer) => handleSelect(question.id, answer)}
              question={{
                ...question,
                reviewHref: question.reviewHref ?? `#part-${String(Math.min(index + 1, 3)).padStart(2, "0")}`,
                reviewLabel:
                  question.reviewLabel ??
                  `Review part ${String(Math.min(index + 1, 3)).padStart(2, "0")}`,
              }}
              selected={answers[question.id] ?? null}
            />
          ))}
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <Button
            className="w-full bg-orange-500 !text-black hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={!allAnswered}
            onClick={handleCheckAnswers}
            type="button"
            variant="primary"
          >
            {quizPassed
              ? "Lesson completed"
              : allAnswered
                ? "Check answers"
                : `Answer all ${questions.length} questions`}
          </Button>
          {next ? (
            <button
              className="mt-3 w-full rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
              onClick={() => setSkipped(true)}
              type="button"
            >
              Skip for now
            </button>
          ) : null}
          {!loaded || saveState === "saving" || saveState === "error" ? (
            <p
              className={`mt-3 text-center text-xs uppercase tracking-[0.16em] ${
                saveState === "error" ? "text-red-300" : "text-zinc-500"
              }`}
            >
              {!loaded
                ? "Syncing progress..."
                : saveState === "saving"
                  ? "Saving progress..."
                  : "Progress save failed"}
            </p>
          ) : null}
        </div>
      </section>

      <QuizResult
        correct={correctCount}
        passed={quizPassed}
        total={questions.length}
      />
      <LessonNavigation
        canProceed={quizPassed || skipped}
        next={next}
        previous={previous}
      />
    </div>
  );
}
