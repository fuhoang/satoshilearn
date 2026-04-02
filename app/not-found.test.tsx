import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import NotFound from "@/app/not-found";

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

describe("app not-found", () => {
  it("renders the shared 404 fallback with recovery links", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: "This page is off the map." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Explore lessons" })).toHaveAttribute(
      "href",
      "/learn",
    );
  });
});
