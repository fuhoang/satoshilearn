import { render, screen } from "@testing-library/react";

import PurchasesPage from "@/app/(dashboard)/purchases/page";

describe("purchases page route", () => {
  it("renders the billing placeholder copy", () => {
    render(<PurchasesPage />);

    expect(
      screen.getByText("Subscription and purchase history"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No purchases are linked to this account yet."),
    ).toBeInTheDocument();
    expect(screen.getByText("Current state")).toBeInTheDocument();
  });
});
