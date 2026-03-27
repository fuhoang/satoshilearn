const getUser = vi.fn();
const upsert = vi.fn();
const select = vi.fn();
const single = vi.fn();
const from = vi.fn();
const createServerSupabaseClient = vi.fn();
const getSupabaseBrowserEnv = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => createServerSupabaseClient(),
}));

vi.mock("@/lib/supabase/config", () => ({
  getSupabaseBrowserEnv: () => getSupabaseBrowserEnv(),
}));

describe("profile route", () => {
  beforeEach(() => {
    getUser.mockReset();
    upsert.mockReset();
    select.mockReset();
    single.mockReset();
    from.mockReset();
    createServerSupabaseClient.mockReset();

    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser,
      },
      from,
    });
    getSupabaseBrowserEnv.mockReturnValue({
      url: "https://project.supabase.co",
      anonKey: "public-key",
    });
    from.mockReturnValue({
      upsert,
    });
    upsert.mockReturnValue({
      select,
    });
    select.mockReturnValue({
      single,
    });
  });

  it("rejects unauthenticated updates", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
    });

    const { POST } = await import("@/app/api/profile/route");
    const response = await POST(
      new Request("http://localhost/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display_name: "Satoshi" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("sanitizes and persists profile details", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
    });
    single.mockResolvedValue({
      data: {
        id: "user-1",
        email: "user@example.com",
        display_name: "Satoshi",
        avatar_url:
          "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
        bio: "Bitcoin learner",
        timezone: "Europe/London",
        created_at: "2026-03-24T00:00:00.000Z",
      },
      error: null,
    });

    const { POST } = await import("@/app/api/profile/route");
    const response = await POST(
      new Request("http://localhost/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: "  Satoshi  ",
          avatar_url:
            "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
          bio: "  Bitcoin learner  ",
          timezone: "  Europe/London  ",
        }),
      }),
    );

    expect(upsert).toHaveBeenCalledWith(
      {
        avatar_url:
          "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
        bio: "Bitcoin learner",
        display_name: "Satoshi",
        email: "user@example.com",
        id: "user-1",
        timezone: "Europe/London",
      },
      { onConflict: "id" },
    );
    expect(response.status).toBe(200);
  });

  it("drops invalid avatar urls", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
    });
    single.mockResolvedValue({
      data: {
        id: "user-1",
        email: "user@example.com",
        display_name: null,
        avatar_url: null,
        bio: null,
        timezone: null,
        created_at: "2026-03-24T00:00:00.000Z",
      },
      error: null,
    });

    const { POST } = await import("@/app/api/profile/route");
    await POST(
      new Request("http://localhost/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar_url: "https://example.com/avatar.png",
        }),
      }),
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar_url: null,
      }),
      { onConflict: "id" },
    );
  });

  it("drops avatar urls owned by a different user", async () => {
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
    });
    single.mockResolvedValue({
      data: {
        id: "user-1",
        email: "user@example.com",
        display_name: null,
        avatar_url: null,
        bio: null,
        timezone: null,
        created_at: "2026-03-24T00:00:00.000Z",
      },
      error: null,
    });

    const { POST } = await import("@/app/api/profile/route");
    await POST(
      new Request("http://localhost/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar_url:
            "https://project.supabase.co/storage/v1/object/public/avatars/user-2/avatar.png",
        }),
      }),
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar_url: null,
      }),
      { onConflict: "id" },
    );
  });
});
