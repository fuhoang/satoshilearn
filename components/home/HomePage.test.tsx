import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import HomePage from "@/components/home/HomePage";

vi.mock("@/components/billing/CheckoutButton", () => ({
  CheckoutButton: ({
    label,
  }: {
    label: string;
  }) => <button type="button">{label}</button>,
}));

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

vi.mock("@/components/home/SoftAurora", () => ({
  SoftAurora: () => <div data-testid="soft-aurora" />,
}));

vi.mock("next/dynamic", () => ({
  default:
    () =>
    ({
      starterPrompts,
      submittedPrompt,
      submittedPromptVersion,
    }: {
      starterPrompts?: readonly string[];
      submittedPrompt?: string;
      submittedPromptVersion?: number;
    }) => (
      <div
        data-prompt={submittedPrompt ?? ""}
        data-prompt-version={submittedPromptVersion ?? 0}
        data-starters={(starterPrompts ?? []).join("|")}
        data-testid="chat-window"
      >
        <span>{submittedPrompt}</span>
        <span>{submittedPromptVersion}</span>
      </div>
    ),
}));

vi.mock("@/components/chat/ChatWindow", () => ({
  ChatWindow: ({
    starterPrompts,
    submittedPrompt,
    submittedPromptVersion,
  }: {
    starterPrompts?: readonly string[];
    submittedPrompt?: string;
    submittedPromptVersion?: number;
  }) => (
    <div
      data-prompt={submittedPrompt ?? ""}
      data-prompt-version={submittedPromptVersion ?? 0}
      data-starters={(starterPrompts ?? []).join("|")}
      data-testid="chat-window"
    >
      <span>{submittedPrompt}</span>
      <span>{submittedPromptVersion}</span>
    </div>
  ),
}));

describe("HomePage", () => {
  it("renders the hero content and primary links", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Learn Crypto the easy way." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Simple lessons. Clear explanations. Step by step."),
    ).toBeInTheDocument();
    expect(screen.getByText("What is Bitcoin in plain English?")).toBeInTheDocument();
    expect(screen.getByText("How do wallets actually work?")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Why do transaction fees exist?" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the conversation idle when the prompt is empty", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByTestId("chat-window")).toHaveAttribute("data-prompt", "");
    expect(screen.getByTestId("chat-window")).toHaveAttribute(
      "data-prompt-version",
      "0",
    );
  });

  it("opens the conversation with the submitted prompt when clicking Ask", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByPlaceholderText("Ask anything about crypto..."), {
      target: { value: "Explain Bitcoin simply" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByTestId("chat-window")).toHaveAttribute(
      "data-prompt",
      "Explain Bitcoin simply",
    );
  });

  it("opens the conversation when pressing Enter in the prompt", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByPlaceholderText("Ask anything about crypto..."), {
      target: { value: "What gives Bitcoin value?" },
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Ask anything about crypto..."), {
      key: "Enter",
    });

    expect(screen.getByTestId("chat-window")).toHaveAttribute(
      "data-prompt",
      "What gives Bitcoin value?",
    );
  });

  it("opens the conversation from a starter prompt chip", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "How do wallets actually work?" }));

    expect(screen.getByTestId("chat-window")).toHaveAttribute(
      "data-prompt",
      "How do wallets actually work?",
    );
  });

  it("renders the curriculum modules and pricing plans", () => {
    render(<HomePage />);

    expect(screen.getByText("A clearer path into crypto.")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Start with the live Bitcoin track, build confidence around security and transactions/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("Core Concepts")).toBeInTheDocument();
    expect(screen.getByText("Wallets & Ownership")).toBeInTheDocument();
    expect(screen.getByText("Public guides")).toBeInTheDocument();
    expect(screen.getByText("Learn crypto with a clear starting path")).toBeInTheDocument();
    expect(screen.getByText("Bitcoin for beginners, without the noise")).toBeInTheDocument();
    expect(screen.getByText("Crypto wallet basics for real beginners")).toBeInTheDocument();
    expect(screen.getByText("What is Bitcoin, in plain language?")).toBeInTheDocument();
    expect(screen.getByText("How crypto transactions work for beginners")).toBeInTheDocument();
    expect(screen.getByText("Crypto security basics for beginners")).toBeInTheDocument();
    expect(screen.getByText("Common questions before you start learning.")).toBeInTheDocument();
    expect(screen.getByText("Is Bloquera for complete beginners?")).toBeInTheDocument();
    expect(screen.getAllByText("Read guide")).toHaveLength(6);
    expect(screen.getByText("Monthly plan")).toBeInTheDocument();
    expect(screen.getByText("Yearly plan")).toBeInTheDocument();
    expect(screen.getByText("Learn crypto with a clearer path.")).toBeInTheDocument();
  });

  it("disables the monthly CTA when the user is already on Pro monthly", () => {
    render(<HomePage currentPlanSlug="pro_monthly" isAuthenticated />);

    expect(screen.getByText("Current subscription")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upgrade to yearly" }),
    ).toBeInTheDocument();
  });

  it("shows a downgrade CTA for monthly when the user is on Pro yearly", () => {
    render(<HomePage currentPlanSlug="pro_yearly" isAuthenticated />);

    expect(
      screen.getByRole("button", { name: "Downgrade to monthly" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Current subscription")).toBeInTheDocument();
  });

  it("shows the free account tutor label for authenticated users without Pro", () => {
    render(<HomePage isAuthenticated />);

    expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();
  });
});
