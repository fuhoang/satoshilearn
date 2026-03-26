import { GET, POST } from "@/app/api/activity/route";

const cookieState = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieState.get(name);
      return value ? { value } : undefined;
    },
  }),
}));

describe("activity route", () => {
  beforeEach(() => {
    cookieState.clear();
  });

  it("returns empty activity by default", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(payload).toEqual({
      conversionEvents: [],
      lessonCompletions: [],
      quizAttempts: [],
      tutorPrompts: [],
    });
  });

  it("stores lesson completions in the fallback cookie payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "lesson_completion",
          lessonSlug: "what-is-money",
          lessonTitle: "What Is Money?",
          completedAt: "2026-03-25T18:00:00.000Z",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie");

    expect(setCookie).toContain("satoshilearn-activity=");
    expect(setCookie).toContain("HttpOnly");

    cookieState.set(
      "satoshilearn-activity",
      JSON.stringify(await response.json()),
    );

    const getResponse = await GET();
    const payload = await getResponse.json();

    expect(payload.lessonCompletions).toEqual([
      {
        lessonSlug: "what-is-money",
        lessonTitle: "What Is Money?",
        completedAt: "2026-03-25T18:00:00.000Z",
      },
    ]);
  });

  it("stores quiz attempts in the fallback cookie payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "quiz_attempt",
          lessonSlug: "what-is-money",
          lessonTitle: "What Is Money?",
          correctCount: 3,
          totalQuestions: 3,
          passed: true,
          attemptedAt: "2026-03-25T18:05:00.000Z",
        }),
      }),
    );

    const payload = await response.json();

    expect(payload.quizAttempts).toEqual([
      {
        lessonSlug: "what-is-money",
        lessonTitle: "What Is Money?",
        correctCount: 3,
        totalQuestions: 3,
        passed: true,
        attemptedAt: "2026-03-25T18:05:00.000Z",
      },
    ]);
    expect(payload.conversionEvents).toEqual([]);
  });

  it("stores tutor prompts in the fallback cookie payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "tutor_prompt",
          lessonSlug: "ai-tutor",
          lessonTitle: "How does Bitcoin supply work?",
          repliedAt: "2026-03-25T18:10:00.000Z",
          responsePreview: "Bitcoin supply is capped at 21 million.",
          topic: "Bitcoin foundations",
        }),
      }),
    );

    const payload = await response.json();

    expect(payload.tutorPrompts).toEqual([
      {
        prompt: "How does Bitcoin supply work?",
        repliedAt: "2026-03-25T18:10:00.000Z",
        responsePreview: "Bitcoin supply is capped at 21 million.",
        topic: "Bitcoin foundations",
      },
    ]);
    expect(payload.conversionEvents).toEqual([]);
  });

  it("stores conversion events in the fallback cookie payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "conversion_event",
          eventType: "upgrade_click",
          source: "learn_overview_module_card",
          targetSlug: "advanced-basics",
          targetTitle: "Advanced Basics",
          occurredAt: "2026-03-25T18:15:00.000Z",
          plan: null,
        }),
      }),
    );

    const payload = await response.json();

    expect(payload.conversionEvents).toEqual([
      {
        eventType: "upgrade_click",
        occurredAt: "2026-03-25T18:15:00.000Z",
        plan: null,
        source: "learn_overview_module_card",
        targetSlug: "advanced-basics",
        targetTitle: "Advanced Basics",
      },
    ]);
  });
});
