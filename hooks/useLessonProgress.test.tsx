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
      new Response(JSON.stringify({ completedLessonSlugs: ["what-is-money"] }), {
        status: 200,
        headers: {
          "x-progress-viewer-id": "user-1",
        },
      }),
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
            {
              status: 200,
              headers: {
                "x-progress-viewer-id": "user-1",
              },
            },
          );
        }

        return new Response(
          JSON.stringify({
            saved: true,
            completedLessonSlugs: ["what-is-money"],
          }),
          {
            status: 200,
            headers: {
              "x-progress-viewer-id": "user-1",
            },
          },
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
    await waitFor(() => {
      expect(
        window.localStorage.getItem("satoshilearn.lesson-progress:user-1"),
      ).toBe(JSON.stringify({ completedLessonSlugs: ["what-is-money"] }));
    });

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
        new Response(
          JSON.stringify({ completedLessonSlugs: [] }),
          {
            status: 200,
            headers: {
              "x-progress-viewer-id": "user-1",
            },
          },
        ),
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

  it("does not merge a previous browser user's local progress into the current account", async () => {
    window.localStorage.setItem(
      "satoshilearn.lesson-progress",
      JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
    );

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ completedLessonSlugs: ["what-is-bitcoin"] }), {
        status: 200,
        headers: {
          "x-progress-viewer-id": "user-2",
        },
      }),
    );

    const { useLessonProgress } = await loadHook();
    const { result } = renderHook(() => useLessonProgress());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.completedLessonSlugs).toEqual(["what-is-bitcoin"]);
    expect(result.current.isLessonCompleted("what-is-money")).toBe(false);
    expect(result.current.isLessonCompleted("what-is-bitcoin")).toBe(true);
    expect(window.localStorage.getItem("satoshilearn.lesson-progress:user-2")).toBe(
      JSON.stringify({ completedLessonSlugs: ["what-is-bitcoin"] }),
    );
  });

  it("retries syncing same-user local progress when the server starts behind", async () => {
    window.localStorage.setItem(
      "satoshilearn.lesson-progress:user-1",
      JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
    );

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockImplementation(async (_input, init) => {
        if (!init || init.method === "GET") {
          return new Response(JSON.stringify({ completedLessonSlugs: [] }), {
            status: 200,
            headers: {
              "x-progress-viewer-id": "user-1",
            },
          });
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

    const { useLessonProgress } = await loadHook();
    const { result } = renderHook(() => useLessonProgress());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.completedLessonSlugs).toEqual(["what-is-money"]);
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

  it("keeps scoped progress separate when two different users use the same browser", async () => {
    window.localStorage.setItem(
      "satoshilearn.lesson-progress:user-1",
      JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
    );
    window.localStorage.setItem(
      "satoshilearn.lesson-progress:user-2",
      JSON.stringify({ completedLessonSlugs: ["what-is-bitcoin"] }),
    );

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ completedLessonSlugs: ["what-is-bitcoin"] }), {
        status: 200,
        headers: {
          "x-progress-viewer-id": "user-2",
        },
      }),
    );

    const { useLessonProgress } = await loadHook();
    const { result } = renderHook(() => useLessonProgress());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.completedLessonSlugs).toEqual(["what-is-bitcoin"]);
    expect(result.current.isLessonCompleted("what-is-money")).toBe(false);
    expect(window.localStorage.getItem("satoshilearn.lesson-progress:user-1")).toBe(
      JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
    );
    expect(window.localStorage.getItem("satoshilearn.lesson-progress:user-2")).toBe(
      JSON.stringify({ completedLessonSlugs: ["what-is-bitcoin"] }),
    );
  });
});
