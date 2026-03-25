const signOut = vi.fn();
const createServerSupabaseClient = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => createServerSupabaseClient(),
}));

describe("auth logout route", () => {
  beforeEach(() => {
    signOut.mockReset();
    createServerSupabaseClient.mockReset();
  });

  it("signs out and redirects to the homepage", async () => {
    createServerSupabaseClient.mockResolvedValue({
      auth: {
        signOut,
      },
    });

    const { POST } = await import("@/app/auth/logout/route");
    const response = await POST(new Request("http://localhost/auth/logout", { method: "POST" }));

    expect(signOut).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("still redirects when Supabase is unavailable", async () => {
    createServerSupabaseClient.mockResolvedValue(null);

    const { POST } = await import("@/app/auth/logout/route");
    const response = await POST(new Request("http://localhost/auth/logout", { method: "POST" }));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });
});
