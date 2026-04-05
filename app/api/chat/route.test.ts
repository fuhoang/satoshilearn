import { POST } from "@/app/api/chat/route";

const createTutorReply = vi.fn();
const getUser = vi.fn();
const createServerSupabaseClient = vi.fn();
const checkRateLimit = vi.fn();
const insert = vi.fn();
const from = vi.fn();
const subscriptionMaybeSingle = vi.fn();
const subscriptionEq = vi.fn();
const subscriptionSelect = vi.fn();
const cookies = vi.fn();
const cookieGet = vi.fn();

vi.mock("@/lib/openai", () => ({
  createTutorReply: (message: string) => createTutorReply(message),
  inferTutorTopic: () => "Bitcoin foundations",
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => createServerSupabaseClient(),
}));

vi.mock("next/headers", () => ({
  cookies: () => cookies(),
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
    insert.mockReset();
    from.mockReset();
    subscriptionMaybeSingle.mockReset();
    subscriptionEq.mockReset();
    subscriptionSelect.mockReset();
    cookies.mockReset();
    cookieGet.mockReset();
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser,
      },
      from,
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
    subscriptionMaybeSingle.mockResolvedValue({ data: null });
    subscriptionEq.mockReturnValue({
      maybeSingle: subscriptionMaybeSingle,
    });
    subscriptionSelect.mockReturnValue({
      eq: subscriptionEq,
    });
    from.mockImplementation((table: string) => {
      if (table === "subscriptions") {
        return {
          select: subscriptionSelect,
        };
      }

      return {
        insert,
      };
    });
    cookies.mockResolvedValue({
      get: cookieGet,
    });
    cookieGet.mockReturnValue(undefined);
    insert.mockResolvedValue({ error: null });
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

  it("rejects malformed request bodies", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please enter a valid tutor question.",
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
        body: JSON.stringify({ message: "What is Bitcoin?", source: "lesson" }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Log in to use the AI tutor.",
    });
  });

  it("allows a limited guest demo on the home page", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
    });
    createTutorReply.mockResolvedValue("Bitcoin reply");

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?", source: "home" }),
      }),
    );

    expect(checkRateLimit).not.toHaveBeenCalledWith(
      expect.stringMatching(/^chat:guest:/),
      3,
      60_000,
    );
    expect(from).not.toHaveBeenCalledWith("learning_activity");
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("blockwise_guest_tutor_id=");
    expect(response.headers.get("set-cookie")).toContain("blockwise_guest_tutor_usage=");
    await expect(response.json()).resolves.toEqual({
      reply: "Bitcoin reply",
      recordedAt: expect.any(String),
      topic: "Bitcoin foundations",
      usage: {
        limit: 3,
        remaining: 2,
        plan: "free",
        resetAt: expect.any(Number),
      },
    });
  });

  it("rate limits the guest home-page demo", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
    });
    cookieGet.mockImplementation((name: string) => {
      if (name === "blockwise_guest_tutor_id") {
        return {
          value: "guest-1",
        };
      }

      if (name === "blockwise_guest_tutor_usage") {
        return {
          value: JSON.stringify({
            count: 3,
            resetAt: Date.now() + 60_000,
          }),
        };
      }

      return undefined;
    });

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?", source: "home" }),
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "You have used the guest AI demo for now. Log in to keep chatting.",
    });
  });

  it("rate limits the guest home-page demo from the usage cookie", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
    });
    cookieGet.mockImplementation((name: string) => {
      if (name === "blockwise_guest_tutor_id") {
        return {
          value: "guest-1",
        };
      }

      if (name === "blockwise_guest_tutor_usage") {
        return {
          value: JSON.stringify({
            count: 3,
          }),
        };
      }

      return undefined;
    });

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?", source: "home" }),
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "You have used the guest AI demo for now. Log in to keep chatting.",
    });
  });

  it("increments the guest home-page usage cookie up to the limit", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
    });
    createTutorReply.mockResolvedValue("Bitcoin reply");
    cookieGet.mockImplementation((name: string) => {
      if (name === "blockwise_guest_tutor_usage") {
        return {
          value: JSON.stringify({
            count: 2,
          }),
        };
      }

      return undefined;
    });

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?", source: "home" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("blockwise_guest_tutor_usage=");
    await expect(response.json()).resolves.toEqual({
      reply: "Bitcoin reply",
      recordedAt: expect.any(String),
      topic: "Bitcoin foundations",
      usage: {
        limit: 3,
        remaining: 0,
        plan: "free",
        resetAt: expect.any(Number),
      },
    });
  });

  it("returns a service-unavailable response when auth verification fails", async () => {
    getUser.mockRejectedValue(new Error("auth unavailable"));

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "What is Bitcoin?" }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to verify your account right now.",
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
    expect(from).toHaveBeenCalledWith("learning_activity");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        activity_type: "tutor_prompt",
        lesson_slug: "ai-tutor",
        lesson_title: "What is Bitcoin?",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      reply: "Bitcoin reply",
      recordedAt: expect.any(String),
      topic: "Bitcoin foundations",
      usage: {
        limit: 10,
        remaining: 9,
        plan: "free",
        resetAt: expect.any(Number),
      },
    });
  });

  it("returns a larger tutor limit for pro users", async () => {
    subscriptionMaybeSingle.mockResolvedValue({
      data: {
        user_id: "user-1",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_123",
        stripe_price_id: "price_123",
        plan_slug: "pro_monthly",
        status: "active",
        current_period_start: "2026-03-01T00:00:00.000Z",
        current_period_end: "2026-04-01T00:00:00.000Z",
        cancel_at_period_end: false,
        created_at: "2026-03-01T00:00:00.000Z",
        updated_at: "2026-03-01T00:00:00.000Z",
      },
    });
    checkRateLimit.mockReturnValue({
      allowed: true,
      remaining: 29,
      resetAt: Date.now() + 60_000,
    });
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

    expect(checkRateLimit).toHaveBeenCalledWith(
      "chat:user-1",
      30,
      60_000,
    );
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        usage: expect.objectContaining({
          limit: 30,
          remaining: 29,
          plan: "pro",
        }),
      }),
    );
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

  it("returns a service-unavailable response when the tutor fails", async () => {
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

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "The tutor is temporarily unavailable. Please try again shortly.",
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
