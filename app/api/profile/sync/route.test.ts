const getUser = vi.fn();
const createServerSupabaseClient = vi.fn();
const syncProfileForUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => createServerSupabaseClient(),
}));

vi.mock("@/lib/profile", () => ({
  syncProfileForUser: (...args: unknown[]) => syncProfileForUser(...args),
}));

describe("profile sync route", () => {
  beforeEach(() => {
    getUser.mockReset();
    createServerSupabaseClient.mockReset();
    syncProfileForUser.mockReset();
  });

  it("returns 401 when no authenticated user is available", async () => {
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser,
      },
    });
    getUser.mockResolvedValue({
      data: { user: null },
    });

    const { POST } = await import("@/app/api/profile/sync/route");
    const response = await POST();

    expect(response.status).toBe(401);
  });

  it("syncs the authenticated user profile", async () => {
    const user = {
      id: "user-1",
      email: "user@example.com",
    };

    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser,
      },
    });
    getUser.mockResolvedValue({
      data: { user },
    });
    syncProfileForUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      display_name: null,
      created_at: "2026-03-24T00:00:00.000Z",
    });

    const { POST } = await import("@/app/api/profile/sync/route");
    const response = await POST();
    const payload = await response.json();

    expect(syncProfileForUser).toHaveBeenCalledWith(user);
    expect(response.status).toBe(200);
    expect(payload.profile.id).toBe("user-1");
  });

  it("returns a service-unavailable response when auth verification throws", async () => {
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser,
      },
    });
    getUser.mockRejectedValue(new Error("network"));

    const { POST } = await import("@/app/api/profile/sync/route");
    const response = await POST();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to verify your account right now.",
    });
  });
});
