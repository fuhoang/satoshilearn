import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import HomePage from "@/components/home/HomePage";

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

vi.mock("@/components/chat/ChatWindow", () => ({
  ChatWindow: ({
    submittedPrompt,
    submittedPromptVersion,
  }: {
    submittedPrompt?: string;
    submittedPromptVersion?: number;
  }) => (
    <div
      data-prompt={submittedPrompt ?? ""}
      data-prompt-version={submittedPromptVersion ?? 0}
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
    expect(screen.getByText("Clear lessons")).toBeInTheDocument();
    expect(screen.getByText("Safe guidance")).toBeInTheDocument();
    expect(screen.getByText("Built for beginners")).toBeInTheDocument();
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

    expect(screen.getByTestId("chat-window")).toBeInTheDocument();
    expect(screen.getByText("Explain Bitcoin simply")).toBeInTheDocument();
  });

  it("opens the conversation when pressing Enter in the prompt", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByPlaceholderText("Ask anything about crypto..."), {
      target: { value: "What gives Bitcoin value?" },
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Ask anything about crypto..."), {
      key: "Enter",
    });

    expect(screen.getByTestId("chat-window")).toBeInTheDocument();
    expect(screen.getByText("What gives Bitcoin value?")).toBeInTheDocument();
  });

  it("renders the curriculum modules and pricing plans", () => {
    render(<HomePage />);

    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("Core Concepts")).toBeInTheDocument();
    expect(screen.getByText("Wallets & Ownership")).toBeInTheDocument();
    expect(screen.getByText("Monthly plan")).toBeInTheDocument();
    expect(screen.getByText("Yearly plan")).toBeInTheDocument();
  });
});
