import { POST } from "@/app/api/chat/route";

const createTutorReply = vi.fn();

vi.mock("@/lib/openai", () => ({
  createTutorReply: (message: string) => createTutorReply(message),
}));

describe("chat route", () => {
  beforeEach(() => {
    createTutorReply.mockReset();
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
});
