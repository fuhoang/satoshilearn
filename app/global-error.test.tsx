import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import GlobalError from "@/app/global-error";

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

describe("app global-error", () => {
  it("renders the fallback and triggers retry", () => {
    const unstableRetry = vi.fn();

    render(
      <GlobalError
        error={Object.assign(new Error("boom"), { digest: "digest-123" })}
        unstable_retry={unstableRetry}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "We hit a snag loading this page." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Reference: digest-123")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(unstableRetry).toHaveBeenCalledTimes(1);
  });
});
