const responsesCreate = vi.fn();
const openAIConstructor = vi.fn(function OpenAI() {
  return {
    responses: {
      create: responsesCreate,
    },
  };
});

vi.mock("openai", () => ({
  default: openAIConstructor,
}));

describe("openai helpers", () => {
  beforeEach(() => {
    responsesCreate.mockReset();
    openAIConstructor.mockClear();
    process.env.OPENAI_API_KEY = "test-openai-key";
    delete process.env.OPENAI_MODEL;
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
    vi.resetModules();
  });

  it("classifies wallet questions", async () => {
    const { inferTutorTopic } = await import("@/lib/openai");

    expect(inferTutorTopic("How do private keys work?")).toBe("Wallets");
  });

  it("uses the configured OpenAI model and returns the output text", async () => {
    process.env.OPENAI_MODEL = "gpt-test-mini";
    responsesCreate.mockResolvedValue({
      output_text: "Bitcoin is digital money with a fixed supply.",
    });

    const { createTutorReply } = await import("@/lib/openai");
    const reply = await createTutorReply("What is Bitcoin?");

    expect(openAIConstructor).toHaveBeenCalledWith({
      apiKey: "test-openai-key",
    });
    expect(responsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-test-mini",
        input: "What is Bitcoin?",
      }),
    );
    expect(reply).toBe("Bitcoin is digital money with a fixed supply.");
  });

  it("does not expose the internal system prompt in tutor replies", async () => {
    responsesCreate.mockResolvedValue({
      output_text:
        'Bitcoin is a public money system anyone can verify. A good next step is comparing it to a bank ledger.',
    });

    const { createTutorReply } = await import("@/lib/openai");
    const reply = await createTutorReply("What is Bitcoin?");

    expect(reply).not.toContain("System frame:");
    expect(reply).not.toContain("You are the Blockwise AI tutor");
    expect(reply).not.toContain("Current topic focus:");
  });

  it("throws when OpenAI is not configured", async () => {
    delete process.env.OPENAI_API_KEY;

    const { createTutorReply } = await import("@/lib/openai");

    await expect(createTutorReply("What is Bitcoin?")).rejects.toThrow(
      "OpenAI is not configured.",
    );
  });

  it("returns the empty-message reply without calling OpenAI", async () => {
    const { createTutorReply } = await import("@/lib/openai");
    const reply = await createTutorReply("   ");

    expect(reply).toBe(
      "Ask about Bitcoin, money, wallets, or transactions and I will break it down step by step.",
    );
    expect(responsesCreate).not.toHaveBeenCalled();
  });
});
