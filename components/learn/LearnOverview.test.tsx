import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { LearnOverview } from "@/components/learn/LearnOverview";
import type { ModuleMeta } from "@/types/lesson";

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

const modules: ModuleMeta[] = [
  {
    slug: "foundations",
    title: "Foundations",
    description: "Understand the basics before anything else",
    order: 1,
    lessons: [
      {
        slug: "what-is-money",
        title: "What Is Money?",
        summary: "Money basics",
        duration: "8 min",
        order: 1,
        section: "Foundations",
      },
      {
        slug: "what-is-bitcoin",
        title: "What Is Bitcoin?",
        summary: "Bitcoin basics",
        duration: "12 min",
        order: 2,
        section: "Foundations",
      },
    ],
  },
];

describe("LearnOverview", () => {
  beforeEach(() => {
    mockUseLessonProgress.mockReset();
  });

  it("renders overall and module progress from lesson completion state", () => {
    mockUseLessonProgress.mockReturnValue({
      completedCount: 1,
      isLessonCompleted: (slug: string) => slug === "what-is-money",
      markLessonCompleted: vi.fn(),
      completedLessonSlugs: ["what-is-money"],
    });

    render(<LearnOverview modules={modules} totalLessons={2} />);

    expect(screen.getAllByText("1 of 2 lessons completed")).toHaveLength(2);
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open module" })).toHaveAttribute(
      "href",
      "/learn/module/foundations",
    );
  });
});
