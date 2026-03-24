import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import ModuleOverview from "@/components/learn/ModuleOverview";
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

const moduleData: ModuleMeta = {
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
    {
      slug: "why-does-bitcoin-matter",
      title: "Why Does Bitcoin Matter?",
      summary: "Bitcoin importance",
      duration: "8 min",
      order: 3,
      section: "Foundations",
    },
  ],
};

describe("ModuleOverview", () => {
  beforeEach(() => {
    mockUseLessonProgress.mockReset();
  });

  it("shows completed, unlocked, and locked lessons with the correct CTA", () => {
    mockUseLessonProgress.mockReturnValue({
      completedLessonSlugs: ["what-is-money"],
      completedCount: 1,
      isLessonCompleted: (slug: string) => slug === "what-is-money",
      markLessonCompleted: vi.fn(),
    });

    render(<ModuleOverview module={moduleData} />);

    expect(screen.getByRole("link", { name: "Continue module" })).toHaveAttribute(
      "href",
      "/learn/what-is-bitcoin",
    );
    expect(screen.getByText("1 of 3 lessons completed")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Unlocked")).toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review lesson" })).toHaveAttribute(
      "href",
      "/learn/what-is-money",
    );
    expect(screen.getByRole("link", { name: "Open lesson" })).toHaveAttribute(
      "href",
      "/learn/what-is-bitcoin",
    );
    expect(screen.getByText("Finish the previous lesson")).toBeInTheDocument();
  });
});
