import { act, renderHook, waitFor } from "@testing-library/react";

async function loadHook() {
  vi.resetModules();
  return import("@/hooks/useLessonProgress");
}

describe("useLessonProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("loads persisted progress from the API", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
        { status: 200 },
      ),
    );

    const { useLessonProgress } = await loadHook();
    const { result } = renderHook(() => useLessonProgress());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.completedCount).toBe(1);
    expect(result.current.isLessonCompleted("what-is-money")).toBe(true);
  });

  it("optimistically persists completed lessons locally and to the API", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(
      async (input, init) => {
        if (!init || init.method === "GET") {
          return new Response(
            JSON.stringify({ completedLessonSlugs: [] }),
            { status: 200 },
          );
        }

        return new Response(
          JSON.stringify({
            saved: true,
            completedLessonSlugs: ["what-is-money"],
          }),
          { status: 200 },
        );
      },
    );

    const { useLessonProgress } = await loadHook();
    const { result } = renderHook(() => useLessonProgress());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    act(() => {
      result.current.markLessonCompleted("what-is-money");
    });

    expect(result.current.completedCount).toBe(1);
    expect(result.current.isLessonCompleted("what-is-money")).toBe(true);
    expect(window.localStorage.getItem("satoshilearn.lesson-progress")).toBe(
      JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
      });
    });
  });

  it("does not duplicate a lesson when completed twice", async () => {
    vi.spyOn(global, "fetch").mockImplementation(
      async () =>
        new Response(JSON.stringify({ completedLessonSlugs: [] }), {
          status: 200,
        }),
    );

    const { useLessonProgress } = await loadHook();
    const { result } = renderHook(() => useLessonProgress());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    act(() => {
      result.current.markLessonCompleted("what-is-money");
      result.current.markLessonCompleted("what-is-money");
    });

    expect(result.current.completedLessonSlugs).toEqual(["what-is-money"]);
    expect(result.current.completedCount).toBe(1);
  });
});
