import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import type { ModuleMeta, TrackMeta } from "@/types/lesson";

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

vi.mock("@/components/chat/ChatWindow", () => ({
  ChatWindow: () => <div data-testid="chat-window" />,
}));

vi.mock("@/components/quiz/QuizCard", () => ({
  QuizCard: () => <div data-testid="quiz-card" />,
}));

const currentTrack: TrackMeta = {
  slug: "bitcoin",
  title: "Bitcoin",
  description: "Current live track",
  order: 1,
  status: "available",
};

const modules: ModuleMeta[] = [
  {
    slug: "foundations",
    title: "Foundations",
    description: "Understand the basics before anything else",
    order: 1,
    track: "bitcoin",
    lessons: [
      {
        slug: "what-is-money",
        title: "What Is Money?",
        summary: "Money basics",
        duration: "8 min",
        order: 1,
        track: "bitcoin",
        section: "Foundations",
      },
      {
        slug: "what-is-bitcoin",
        title: "What Is Bitcoin?",
        summary: "Bitcoin basics",
        duration: "12 min",
        order: 2,
        track: "bitcoin",
        section: "Foundations",
      },
    ],
  },
  {
    slug: "core-concepts",
    title: "Core Concepts",
    description: "Build real understanding",
    order: 2,
    track: "bitcoin",
    lessons: [
      {
        slug: "how-bitcoin-works-simple-view",
        title: "How Bitcoin Works (Simple View)",
        summary: "How the network works",
        duration: "9 min",
        order: 3,
        track: "bitcoin",
        section: "Core Concepts",
      },
    ],
  },
];

describe("DashboardOverview", () => {
  beforeEach(() => {
    mockUseLessonProgress.mockReset();
  });

  it("renders progress, current module, and account summaries", () => {
    mockUseLessonProgress.mockReturnValue({
      loaded: true,
      completedCount: 1,
      completedLessonSlugs: ["what-is-money"],
      isLessonCompleted: (slug: string) => slug === "what-is-money",
      markLessonCompleted: vi.fn(),
    });

    render(
      <DashboardOverview
        currentTrack={currentTrack}
        modules={modules}
        profileLabel="Satoshi"
        totalLessons={3}
      />,
    );

    expect(screen.getByText("Bitcoin track")).toBeInTheDocument();
    expect(screen.getAllByText("Satoshi")).toHaveLength(2);
    expect(screen.getAllByText("Foundations")).toHaveLength(2);
    expect(screen.getByText("What Is Bitcoin?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open next lesson" })).toHaveAttribute(
      "href",
      "/learn/what-is-bitcoin",
    );
    expect(screen.getByRole("link", { name: "Review module" })).toHaveAttribute(
      "href",
      "/learn/module/foundations",
    );
    expect(screen.getByTestId("quiz-card")).toBeInTheDocument();
    expect(screen.getByTestId("chat-window")).toBeInTheDocument();
  });
});
