import { act, renderHook } from "@testing-library/react";

import { useLessonProgress } from "@/hooks/useLessonProgress";

describe("useLessonProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty and persists completed lessons", () => {
    const { result } = renderHook(() => useLessonProgress());

    expect(result.current.completedCount).toBe(0);
    expect(result.current.isLessonCompleted("what-is-money")).toBe(false);

    act(() => {
      result.current.markLessonCompleted("what-is-money");
    });

    expect(result.current.completedCount).toBe(1);
    expect(result.current.isLessonCompleted("what-is-money")).toBe(true);
    expect(window.localStorage.getItem("satoshilearn.lesson-progress")).toBe(
      JSON.stringify({ completedLessonSlugs: ["what-is-money"] }),
    );
  });

  it("does not duplicate a lesson when completed twice", () => {
    const { result } = renderHook(() => useLessonProgress());

    act(() => {
      result.current.markLessonCompleted("what-is-money");
      result.current.markLessonCompleted("what-is-money");
    });

    expect(result.current.completedLessonSlugs).toEqual(["what-is-money"]);
    expect(result.current.completedCount).toBe(1);
  });
});
