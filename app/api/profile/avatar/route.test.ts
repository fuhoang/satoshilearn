const getUser = vi.fn();
const upload = vi.fn();
const getPublicUrl = vi.fn();
const from = vi.fn();
const createServerSupabaseClient = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => createServerSupabaseClient(),
}));

describe("profile avatar route", () => {
  beforeEach(() => {
    getUser.mockReset();
    upload.mockReset();
    getPublicUrl.mockReset();
    from.mockReset();
    createServerSupabaseClient.mockReset();

    createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser,
      },
      storage: {
        from,
      },
    });
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
        },
      },
    });
    from.mockReturnValue({
      upload,
      getPublicUrl,
    });
    upload.mockResolvedValue({ error: null });
    getPublicUrl.mockReturnValue({
      data: {
        publicUrl:
          "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
      },
    });
  });

  it("requires an authenticated user", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
    });

    const { POST } = await import("@/app/api/profile/avatar/route");
    const formData = new FormData();
    formData.set("file", new File(["avatar"], "avatar.png", { type: "image/png" }));

    const response = await POST({
      formData: async () => formData,
    } as Request);

    expect(response.status).toBe(401);
  });

  it("rejects unsupported file types", async () => {
    const { POST } = await import("@/app/api/profile/avatar/route");
    const formData = new FormData();
    formData.set("file", new File(["avatar"], "avatar.gif", { type: "image/gif" }));

    const response = await POST({
      formData: async () => formData,
    } as Request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Avatar images must be JPG, PNG, or WebP.",
    });
  });

  it("uploads an allowed avatar image", async () => {
    const { POST } = await import("@/app/api/profile/avatar/route");
    const formData = new FormData();
    formData.set("file", new File(["avatar"], "avatar.png", { type: "image/png" }));

    const response = await POST({
      formData: async () => formData,
    } as Request);

    expect(from).toHaveBeenCalledWith("avatars");
    expect(upload).toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      avatarUrl:
        "https://project.supabase.co/storage/v1/object/public/avatars/user-1/avatar.png",
      path: expect.stringContaining("user-1/"),
    });
  });
});
