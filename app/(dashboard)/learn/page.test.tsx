import { render, screen } from "@testing-library/react";

import LearnPage from "@/app/(dashboard)/learn/page";

vi.mock("@/components/learn/LearnOverview", () => ({
  LearnOverview: ({
    modules,
    totalLessons,
  }: {
    modules: { title: string }[];
    totalLessons: number;
  }) => (
    <div data-total-lessons={totalLessons} data-testid="learn-overview">
      {modules.map((module) => (
        <span key={module.title}>{module.title}</span>
      ))}
    </div>
  ),
}));

describe("learn page route", () => {
  it("renders the overview with curriculum data", () => {
    render(<LearnPage />);

    expect(screen.getByTestId("learn-overview")).toHaveAttribute(
      "data-total-lessons",
      "45",
    );
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("Mindset & Strategy")).toBeInTheDocument();
  });
});
