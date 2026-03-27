import { createTutorReply, inferTutorTopic } from "@/lib/openai";

describe("openai helpers", () => {
  it("classifies wallet questions", () => {
    expect(inferTutorTopic("How do private keys work?")).toBe("Wallets");
  });

  it("does not expose the internal system prompt in tutor replies", async () => {
    const reply = await createTutorReply("What is Bitcoin?");

    expect(reply).toContain('You asked: "What is Bitcoin?"');
    expect(reply).not.toContain("System frame:");
    expect(reply).not.toContain("You are the BlockWise tutor.");
  });
});
