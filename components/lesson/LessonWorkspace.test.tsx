import { fireEvent, render, screen } from "@testing-library/react";

import { LessonWorkspace } from "@/components/lesson/LessonWorkspace";

vi.mock("@/components/lesson/LessonContent", () => ({
  LessonContent: ({ lesson }: { lesson: { title: string } }) => (
    <div data-testid="lesson-content">{lesson.title}</div>
  ),
}));

vi.mock("@/components/lesson/LessonTutorPanel", () => ({
  LessonTutorPanel: ({
    isOpen,
    onOpenChange,
  }: {
    isOpen: boolean;
    onOpenChange: (nextOpen: boolean) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onOpenChange(!isOpen)}>
        Toggle tutor
      </button>
      <span data-testid="tutor-state">{isOpen ? "open" : "closed"}</span>
    </div>
  ),
}));

describe("LessonWorkspace", () => {
  afterEach(() => {
    document.body.classList.remove("lesson-tutor-open");
  });

  it("toggles the body class while the tutor is open", () => {
    const { unmount } = render(
      <LessonWorkspace
        keyPoints={["One", "Two"]}
        lesson={{
          body: "Lesson body",
          duration: "8 min",
          order: 1,
          slug: "what-is-money",
          summary: "Summary",
          title: "What Is Money?",
          track: "bitcoin",
        }}
      />,
    );

    expect(document.body.classList.contains("lesson-tutor-open")).toBe(false);
    expect(screen.getByTestId("tutor-state")).toHaveTextContent("closed");

    fireEvent.click(screen.getByRole("button", { name: "Toggle tutor" }));

    expect(document.body.classList.contains("lesson-tutor-open")).toBe(true);
    expect(screen.getByTestId("tutor-state")).toHaveTextContent("open");

    unmount();

    expect(document.body.classList.contains("lesson-tutor-open")).toBe(false);
  });
});
