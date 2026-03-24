import { lessonQuizConfig } from "@/content/quiz-config";
import type { Lesson } from "@/types/lesson";
import type { QuizQuestion } from "@/types/quiz";

function buildFallbackQuiz(lesson: Lesson): QuizQuestion[] {
  return [
    {
      id: `${lesson.slug}-fallback-q1`,
      prompt: `What is the core idea of “${lesson.title}”?`,
      options: [
        lesson.summary,
        "It mainly argues that speed matters more than understanding.",
        "It says Bitcoin works best when only institutions can verify it.",
      ],
      correctAnswer: lesson.summary,
      explanation:
        "This fallback uses the lesson summary so the quiz remains usable even if authored questions are missing.",
    },
    {
      id: `${lesson.slug}-fallback-q2`,
      prompt: "What should a beginner take away from this lesson?",
      options: [
        `A clear understanding of ${lesson.title.toLowerCase()}.`,
        "That the lesson can be skipped without any tradeoffs.",
        "That verification matters less than convenience.",
      ],
      correctAnswer: `A clear understanding of ${lesson.title.toLowerCase()}.`,
      explanation:
        "This fallback keeps progression working, but authored questions are preferred.",
    },
  ];
}

export function buildLessonQuiz(lesson: Lesson): QuizQuestion[] {
  return lessonQuizConfig[lesson.slug] ?? buildFallbackQuiz(lesson);
}
