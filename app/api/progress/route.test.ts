import { GET, POST } from "@/app/api/progress/route";

const cookieState = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieState.get(name);
      return value ? { value } : undefined;
    },
  }),
}));

describe("progress route", () => {
  beforeEach(() => {
    cookieState.clear();
  });

  it("returns empty progress by default", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(payload).toEqual({ completedLessonSlugs: [] });
  });

  it("stores and returns completed lessons", async () => {
    const request = new Request("http://localhost/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug: "what-is-money", complete: true }),
    });

    const response = await POST(request);
    const setCookie = response.headers.get("set-cookie");

    expect(setCookie).toContain("satoshilearn-progress=");
    expect(setCookie).toContain("what-is-money");

    cookieState.set(
      "satoshilearn-progress",
      JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
    );

    const getResponse = await GET();
    const payload = await getResponse.json();

    expect(payload).toEqual({ completedLessonSlugs: ["what-is-money"] });
  });

  it("sanitizes duplicate and invalid slugs in bulk updates", async () => {
    const request = new Request("http://localhost/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completedLessonSlugs: ["what-is-money", "", "what-is-money", 12],
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(payload.completedLessonSlugs).toEqual(["what-is-money"]);
  });
});
