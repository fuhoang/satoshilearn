import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CheckoutButton } from "@/components/billing/CheckoutButton";

const fetchMock = vi.fn();

describe("CheckoutButton", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("shows a clearer billing availability message for 503 responses", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 503,
      }),
    );

    render(
      <CheckoutButton
        className="btn"
        label="Upgrade"
        plan="pro_monthly"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Billing is temporarily unavailable. Please try again shortly.",
        ),
      ).toBeInTheDocument();
    });
  });
});
