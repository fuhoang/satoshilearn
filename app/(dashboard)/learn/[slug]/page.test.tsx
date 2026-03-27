import { render, screen } from "@testing-library/react";

import LearnLessonPage from "@/app/(dashboard)/learn/[slug]/page";

const notFound = vi.fn(() => {
  throw new Error("notFound");
});
const hasProAccessForCurrentUser = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

vi.mock("@/lib/account-status", () => ({
  hasProAccessForCurrentUser: () => hasProAccessForCurrentUser(),
}));

vi.mock("@/components/lesson/LessonHeader", () => ({
  LessonHeader: ({
    lesson,
    module,
    moduleLessonIndex,
  }: {
    lesson: { title: string };
    module: { title: string } | null;
    moduleLessonIndex: number;
  }) => (
    <div
      data-module-index={moduleLessonIndex}
      data-testid="lesson-header"
    >
      <span>{lesson.title}</span>
      <span>{module?.title ?? "No module"}</span>
    </div>
  ),
}));

vi.mock("@/components/lesson/LessonQuizGate", () => ({
  LessonQuizGate: ({
    lessonSlug,
    questions,
  }: {
    lessonSlug: string;
    questions: { id: string }[];
  }) => (
    <div data-question-count={questions.length} data-testid="lesson-quiz-gate">
      {lessonSlug}
    </div>
  ),
}));

vi.mock("@/components/lesson/LessonWorkspace", () => ({
  LessonWorkspace: ({ lesson }: { lesson: { title: string } }) => (
    <div data-testid="lesson-workspace">{lesson.title}</div>
  ),
}));

vi.mock("@/components/lesson/ProgressBar", () => ({
  ProgressBar: ({ value }: { value: number }) => (
    <div data-testid="progress-bar">{value}</div>
  ),
}));

vi.mock("@/components/billing/ProFeatureGate", () => ({
  ProFeatureGate: ({ title }: { title: string }) => (
    <div data-testid="pro-feature-gate">{title}</div>
  ),
}));

describe("learn lesson page route", () => {
  beforeEach(() => {
    notFound.mockClear();
    hasProAccessForCurrentUser.mockReset();
    hasProAccessForCurrentUser.mockResolvedValue(false);
  });

  it("renders the lesson route with module context and quiz data", async () => {
    const page = await LearnLessonPage({
      params: Promise.resolve({ slug: "what-is-money" }),
    });

    render(page);

    expect(screen.getByTestId("lesson-header")).toHaveAttribute(
      "data-module-index",
      "0",
    );
    expect(screen.getAllByText("What Is Money?")).toHaveLength(2);
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByTestId("lesson-workspace")).toHaveTextContent("What Is Money?");
    expect(screen.getByTestId("lesson-quiz-gate")).toHaveAttribute(
      "data-question-count",
      "2",
    );
    expect(screen.getByTestId("progress-bar")).toHaveTextContent("2");
  });

  it("renders the pro gate for premium lessons when the user is free", async () => {
    const page = await LearnLessonPage({
      params: Promise.resolve({ slug: "nodes-explained" }),
    });

    render(page);

    expect(screen.getByTestId("pro-feature-gate")).toHaveTextContent(
      "Nodes Explained is part of Pro",
    );
  });

  it("calls notFound for an unknown lesson slug", async () => {
    await expect(
      LearnLessonPage({
        params: Promise.resolve({ slug: "missing-lesson" }),
      }),
    ).rejects.toThrow("notFound");
  });
});
