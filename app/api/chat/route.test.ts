import { POST } from "@/app/api/chat/route";

const createTutorReply = vi.fn();
const getUser = vi.fn();
const createServerSupabaseClient = vi.fn();
const checkRateLimit = vi.fn();

vi.mock("@/lib/openai", () => ({
  createTutorReply: (message: string) => createTutorReply(message),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => createServerSupabaseClient(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimit(...args),
}));

describe("chat route", () => {
  beforeEach(() => {
    createTutorReply.mockReset();
    getUser.mockReset();
    createServerSupabaseClient.mockReset();
    checkRateLimit.mockReset();
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser,
      },
    });
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
        },
      },
    });
    checkRateLimit.mockReturnValue({
      allowed: true,
      remaining: 9,
      resetAt: Date.now() + 60_000,
    });
  });

  it("rejects empty messages", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "   " }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please enter a question before submitting.",
    });
  });

  it("requires an authenticated user", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
    });

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?" }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Log in to use the AI tutor.",
    });
  });

  it("returns the tutor reply for valid input", async () => {
    createTutorReply.mockResolvedValue("Bitcoin reply");

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?" }),
      }),
    );

    expect(createTutorReply).toHaveBeenCalledWith("What is Bitcoin?");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ reply: "Bitcoin reply" });
  });

  it("rate limits repeated tutor requests", async () => {
    checkRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?" }),
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBeTruthy();
    await expect(response.json()).resolves.toEqual({
      error: "You have reached the tutor limit for now. Please try again in a minute.",
    });
  });

  it("returns a server error when the tutor fails", async () => {
    createTutorReply.mockRejectedValue(new Error("boom"));

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?" }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to process your request right now.",
    });
  });

  it("rejects oversized messages", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "a".repeat(501) }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please keep tutor questions under 500 characters.",
    });
  });
});
