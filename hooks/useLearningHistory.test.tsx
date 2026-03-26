import { act, renderHook, waitFor } from "@testing-library/react";

async function loadHook() {
  vi.resetModules();
  return import("@/hooks/useLearningHistory");
}

describe("useLearningHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      if (!init || init.method === "GET") {
        return new Response(
          JSON.stringify({
            conversionEvents: [],
            lessonCompletions: [],
            quizAttempts: [],
            tutorPrompts: [],
          }),
          { status: 200 },
        );
      }

      return new Response(
        JSON.stringify({
          conversionEvents: [],
          lessonCompletions: [],
          quizAttempts: [],
          tutorPrompts: [],
        }),
        { status: 200 },
      );
    });
  });

  it("records quiz attempts and lesson completions", async () => {
    const { useLearningHistory } = await loadHook();
    const { result } = renderHook(() => useLearningHistory());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/activity", {
        method: "GET",
        cache: "no-store",
      });
    });

    act(() => {
      result.current.recordQuizAttempt({
        lessonSlug: "what-is-money",
        lessonTitle: "What Is Money?",
        correctCount: 2,
        totalQuestions: 3,
        passed: true,
      });
      result.current.recordLessonCompleted({
        lessonSlug: "what-is-money",
        lessonTitle: "What Is Money?",
      });
      result.current.recordTutorPrompt("How does Bitcoin supply work?");
    });

    expect(result.current.quizAttempts).toHaveLength(1);
    expect(result.current.lessonCompletions).toHaveLength(1);
    expect(result.current.tutorPrompts).toHaveLength(1);
    expect(result.current.conversionEvents).toHaveLength(0);
    expect(result.current.tutorPrompts[0]).toMatchObject({
      prompt: "How does Bitcoin supply work?",
      responsePreview: null,
      topic: null,
    });
    expect(result.current.quizAttempts[0]).toMatchObject({
      lessonSlug: "what-is-money",
      passed: true,
    });
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      "/api/activity",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining('"type":"lesson_completion"'),
      }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      4,
      "/api/activity",
      expect.objectContaining({
        body: expect.stringContaining('"type":"tutor_prompt"'),
      }),
    );
  });

  it("does not duplicate lesson completions for the same lesson", async () => {
    const { useLearningHistory } = await loadHook();
    const { result } = renderHook(() => useLearningHistory());

    act(() => {
      result.current.recordLessonCompleted({
        lessonSlug: "what-is-money",
        lessonTitle: "What Is Money?",
      });
      result.current.recordLessonCompleted({
        lessonSlug: "what-is-money",
        lessonTitle: "What Is Money?",
      });
    });

    expect(result.current.lessonCompletions).toHaveLength(1);
  });

  it("records conversion events", async () => {
    const { useLearningHistory } = await loadHook();
    const { result } = renderHook(() => useLearningHistory());

    act(() => {
      result.current.recordConversionEvent({
        eventType: "upgrade_click",
        source: "learn_overview_module_card",
        targetSlug: "advanced-basics",
        targetTitle: "Advanced Basics",
      });
    });

    expect(result.current.conversionEvents).toHaveLength(1);
    expect(result.current.conversionEvents[0]).toMatchObject({
      eventType: "upgrade_click",
      source: "learn_overview_module_card",
      targetSlug: "advanced-basics",
      targetTitle: "Advanced Basics",
      plan: null,
    });
    expect(global.fetch).toHaveBeenLastCalledWith(
      "/api/activity",
      expect.objectContaining({
        body: expect.stringContaining('"type":"conversion_event"'),
      }),
    );
  });
});
