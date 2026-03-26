import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import type { AccountStatus } from "@/lib/account-status";
import type { ModuleMeta, TrackMeta } from "@/types/lesson";

const mockUseLessonProgress = vi.fn();
const mockUseLearningHistory = vi.fn();

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

vi.mock("@/hooks/useLearningHistory", () => ({
  useLearningHistory: () => mockUseLearningHistory(),
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

const accountStatus: AccountStatus = {
  billingSummary: "Free access is active for your account.",
  billingStatus: "No active subscription",
  canManageBilling: true,
  checkoutCtaLabel: "Upgrade to Pro",
  ctaHref: "/purchases",
  ctaLabel: "Open billing hub",
  headline: "Free plan",
  includedFeatures: ["Bitcoin curriculum access"],
  nextStep: "Choose a Pro plan to unlock more.",
  planLabel: "Free",
  planSummary: "Free plan summary",
  upcomingFeatures: ["Priority learning tracks and future premium modules"],
};

describe("DashboardOverview", () => {
  beforeEach(() => {
    mockUseLessonProgress.mockReset();
    mockUseLearningHistory.mockReset();
    mockUseLearningHistory.mockReturnValue({
      lessonCompletions: [],
      quizAttempts: [],
      tutorPrompts: [],
      recordLessonCompleted: vi.fn(),
      recordQuizAttempt: vi.fn(),
      recordTutorPrompt: vi.fn(),
    });
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
        accountStatus={accountStatus}
        currentTrack={currentTrack}
        modules={modules}
        profileLabel="Satoshi"
        totalLessons={3}
      />,
    );

    expect(screen.getAllByText("Bitcoin track")).toHaveLength(2);
    expect(screen.getAllByText("Satoshi")).toHaveLength(2);
    expect(screen.getAllByText("Foundations")).toHaveLength(2);
    expect(screen.getByText("No active subscription")).toBeInTheDocument();
    expect(screen.getByText("What Is Bitcoin?")).toBeInTheDocument();
    expect(screen.getByText("No tutor prompts yet")).toBeInTheDocument();
    expect(screen.getByText("0 days")).toBeInTheDocument();
    expect(screen.getByText("0 / 0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open next lesson" })).toHaveAttribute(
      "href",
      "/learn/what-is-bitcoin",
    );
    expect(screen.getByRole("link", { name: "Review module" })).toHaveAttribute(
      "href",
      "/learn/module/foundations",
    );
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-card")).toBeInTheDocument();
    expect(screen.getByTestId("chat-window")).toBeInTheDocument();
  });

  it("renders recent activity and quiz history when available", () => {
    mockUseLessonProgress.mockReturnValue({
      loaded: true,
      completedCount: 2,
      completedLessonSlugs: ["what-is-money", "what-is-bitcoin"],
      isLessonCompleted: (slug: string) =>
        ["what-is-money", "what-is-bitcoin"].includes(slug),
      markLessonCompleted: vi.fn(),
    });
    mockUseLearningHistory.mockReturnValue({
      lessonCompletions: [
        {
          lessonSlug: "what-is-bitcoin",
          lessonTitle: "What Is Bitcoin?",
          completedAt: "2026-03-25T11:00:00.000Z",
        },
      ],
      quizAttempts: [
        {
          lessonSlug: "what-is-bitcoin",
          lessonTitle: "What Is Bitcoin?",
          attemptedAt: "2026-03-25T11:05:00.000Z",
          correctCount: 3,
          totalQuestions: 3,
          passed: true,
        },
      ],
      tutorPrompts: [
        {
          prompt: "Why does Bitcoin have a fixed supply?",
          repliedAt: "2026-03-25T11:10:00.000Z",
          responsePreview: "Bitcoin supply is capped and follows a fixed issuance schedule.",
          topic: "Bitcoin foundations",
        },
      ],
      recordLessonCompleted: vi.fn(),
      recordQuizAttempt: vi.fn(),
      recordTutorPrompt: vi.fn(),
    });

    render(
      <DashboardOverview
        accountStatus={accountStatus}
        currentTrack={currentTrack}
        modules={modules}
        profileLabel="Satoshi"
        totalLessons={3}
      />,
    );

    expect(screen.getByText("Quiz passed")).toBeInTheDocument();
    expect(screen.getByText("Lesson completed")).toBeInTheDocument();
    expect(screen.getByText("3 of 3 correct")).toBeInTheDocument();
    expect(screen.getByText("Protected account")).toBeInTheDocument();
    expect(screen.getByText("Tutor session")).toBeInTheDocument();
    expect(screen.getAllByText("Why does Bitcoin have a fixed supply?")[0]).toBeInTheDocument();
    expect(screen.getByText("Bitcoin supply is capped and follows a fixed issuance schedule.")).toBeInTheDocument();
    expect(screen.getAllByText("Bitcoin foundations")).not.toHaveLength(0);
  });
});
