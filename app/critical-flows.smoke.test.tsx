import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import PurchasesPage from "@/app/(dashboard)/purchases/page";
import { AuthForm } from "@/components/auth/AuthForm";

const signInWithPassword = vi.fn();
const signInWithOAuth = vi.fn();
const resend = vi.fn();
const createBrowserSupabaseClient = vi.fn();
const hasSupabaseEnv = vi.fn();
const fetchMock = vi.fn();
const getBillingContextForCurrentUser = vi.fn();

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

vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: () => createBrowserSupabaseClient(),
}));

vi.mock("@/lib/supabase/config", () => ({
  hasSupabaseEnv: () => hasSupabaseEnv(),
}));

vi.mock("@/lib/account-status", () => ({
  getBillingContextForCurrentUser: () => getBillingContextForCurrentUser(),
}));

vi.mock("@/components/purchases/BillingActions", () => ({
  BillingActions: ({
    canOpenPortal,
  }: {
    canOpenPortal: boolean;
  }) => <div>{canOpenPortal ? "Checkout and portal actions" : "Checkout actions"}</div>,
}));

vi.mock("@/components/purchases/UpgradeFunnel", () => ({
  UpgradeFunnel: () => <div>Upgrade funnel</div>,
}));

async function loadLessonProgressHook() {
  vi.resetModules();
  return import("@/hooks/useLessonProgress");
}

describe("critical flows smoke", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    signInWithPassword.mockReset();
    signInWithOAuth.mockReset();
    resend.mockReset();
    createBrowserSupabaseClient.mockReset();
    hasSupabaseEnv.mockReset();
    fetchMock.mockReset();
    getBillingContextForCurrentUser.mockReset();
    hasSupabaseEnv.mockReturnValue(true);
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        assign: vi.fn(),
        origin: "http://localhost:3000",
      },
      writable: true,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("auth: logs a user in and redirects to the requested path", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    createBrowserSupabaseClient.mockReturnValue({
      auth: {
        resend,
        signInWithOAuth,
        signInWithPassword,
      },
    });

    render(<AuthForm mode="login" nextPath="/learn" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith("/learn");
    });
  });

  it("progress: surfaces a save failure and retries until the server accepts it", async () => {
    let postAttempts = 0;

    fetchMock.mockImplementation(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (!init || init.method === "GET") {
        return new Response(
          JSON.stringify({ completedLessonSlugs: [] }),
          {
            status: 200,
            headers: {
              "x-progress-viewer-id": "user-1",
            },
          },
        );
      }

      postAttempts += 1;

      if (postAttempts === 1) {
        return new Response(
          JSON.stringify({ error: "Unable to save progress right now." }),
          { status: 500 },
        );
      }

      return new Response(
        JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
        {
          status: 200,
          headers: {
            "x-progress-viewer-id": "user-1",
          },
        },
      );
    });

    const { useLessonProgress } = await loadLessonProgressHook();
    const { result } = renderHook(() => useLessonProgress());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    act(() => {
      result.current.markLessonCompleted("what-is-money");
    });

    await waitFor(() => {
      expect(result.current.saveState).toBe("error");
    });

    expect(result.current.saveError).toBe("Unable to save progress right now.");

    act(() => {
      result.current.retryLastSave();
    });

    await waitFor(() => {
      expect(result.current.saveState).toBe("idle");
    });
    expect(result.current.completedLessonSlugs).toEqual(["what-is-money"]);
  });

  it("billing: renders a paid account state with portal access", async () => {
    getBillingContextForCurrentUser.mockResolvedValue({
      accountStatus: {
        billingSummary: "Pro monthly is active.",
        billingStatus: "Active subscription",
        canManageBilling: true,
        checkoutCtaLabel: "Change plan",
        ctaHref: "/purchases",
        ctaLabel: "Open billing hub",
        headline: "Pro monthly",
        includedFeatures: ["Everything in the free plan"],
        nextStep: "Use the billing hub to review renewals.",
        planLabel: "Pro",
        planSummary: "Pro summary",
        upcomingFeatures: ["More premium tracks and usage controls will build on this plan."],
      },
      billingSnapshot: {
        configured: true,
        customerId: "cus_123",
        purchaseEvents: [
          {
            id: "evt_1",
            user_id: "user-1",
            subscription_id: "sub_123",
            stripe_invoice_id: "in_123",
            stripe_checkout_session_id: null,
            event_type: "invoice.paid",
            amount_cents: 1499,
            currency: "gbp",
            status: "paid",
            created_at: "2026-03-25T00:00:00.000Z",
          },
        ],
        subscription: null,
      },
      priceMap: {
        pro_monthly: "price_monthly",
        pro_yearly: "price_yearly",
      },
      profile: {
        id: "user-1",
        email: "satoshi@example.com",
        display_name: "Satoshi",
        avatar_url: null,
        bio: null,
        timezone: null,
        created_at: "2026-03-01T00:00:00.000Z",
      },
    });

    const page = await PurchasesPage();

    render(page);

    expect(screen.getByText("Pro monthly")).toBeInTheDocument();
    expect(screen.getByText("Checkout and portal actions")).toBeInTheDocument();
    expect(screen.getByText("invoice.paid")).toBeInTheDocument();
  });
});
