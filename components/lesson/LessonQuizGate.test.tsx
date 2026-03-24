import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { LessonQuizGate } from "@/components/lesson/LessonQuizGate";
import type { LessonMeta } from "@/types/lesson";
import type { QuizQuestion } from "@/types/quiz";

const mockUseLessonProgress = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/useLessonProgress", () => ({
  useLessonProgress: () => mockUseLessonProgress(),
}));

const previousLesson: LessonMeta = {
  slug: "what-is-money",
  title: "What Is Money?",
  summary: "Money basics",
  duration: "8 min",
  order: 1,
  section: "Foundations",
};

const nextLesson: LessonMeta = {
  slug: "what-is-bitcoin",
  title: "What Is Bitcoin?",
  summary: "Bitcoin basics",
  duration: "12 min",
  order: 2,
  section: "Foundations",
};

const questions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Question one",
    options: ["Wrong", "Correct one", "Wrong two"],
    correctAnswer: "Correct one",
    explanation: "Because one is right.",
  },
  {
    id: "q2",
    prompt: "Question two",
    options: ["Wrong", "Correct two", "Wrong two"],
    correctAnswer: "Correct two",
    explanation: "Because two is right.",
  },
  {
    id: "q3",
    prompt: "Question three",
    options: ["Wrong", "Correct three", "Wrong two"],
    correctAnswer: "Correct three",
    explanation: "Because three is right.",
  },
];

describe("LessonQuizGate", () => {
  beforeEach(() => {
    mockUseLessonProgress.mockReset();
    mockUseLessonProgress.mockReturnValue({
      completedLessonSlugs: [],
      completedCount: 0,
      isLessonCompleted: () => false,
      markLessonCompleted: vi.fn(),
    });
  });

  it("keeps the next lesson locked until the learner passes or skips", () => {
    render(
      <LessonQuizGate
        lessonSlug="lesson-a"
        next={nextLesson}
        previous={previousLesson}
        questions={questions}
      />,
    );

    expect(screen.getByText("Complete or skip the quiz")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Skip for now" }));

    const nextLink = screen.getByText("What Is Bitcoin?").closest("a");
    expect(nextLink).toHaveAttribute("href", "/learn/what-is-bitcoin");
  });

  it("marks the lesson completed when the learner passes the quiz", () => {
    const markLessonCompleted = vi.fn();

    mockUseLessonProgress.mockReturnValue({
      completedLessonSlugs: [],
      completedCount: 0,
      isLessonCompleted: () => false,
      markLessonCompleted,
    });

    render(
      <LessonQuizGate
        lessonSlug="lesson-a"
        next={nextLesson}
        previous={previousLesson}
        questions={questions}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Correct one" }));
    fireEvent.click(screen.getByRole("button", { name: "Correct two" }));
    fireEvent.click(screen.getByRole("button", { name: "Correct three" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answers" }));

    expect(markLessonCompleted).toHaveBeenCalledWith("lesson-a");
    expect(screen.getByText("Quiz passed")).toBeInTheDocument();
    const nextLink = screen.getByText("What Is Bitcoin?").closest("a");
    expect(nextLink).toHaveAttribute("href", "/learn/what-is-bitcoin");
  });
});
