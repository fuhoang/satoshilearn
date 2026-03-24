import {
  EMPTY_LESSON_PROGRESS,
  sanitizeLessonProgress,
} from "@/lib/progress";

describe("progress helpers", () => {
  it("returns the empty shape for invalid payloads", () => {
    expect(sanitizeLessonProgress(null)).toEqual(EMPTY_LESSON_PROGRESS);
    expect(sanitizeLessonProgress({})).toEqual(EMPTY_LESSON_PROGRESS);
    expect(
      sanitizeLessonProgress({ completedLessonSlugs: "what-is-money" }),
    ).toEqual(EMPTY_LESSON_PROGRESS);
  });

  it("deduplicates and filters invalid lesson slugs", () => {
    expect(
      sanitizeLessonProgress({
        completedLessonSlugs: [
          "what-is-money",
          "",
          "what-is-money",
          42,
          "what-is-bitcoin",
        ],
      }),
    ).toEqual({
      completedLessonSlugs: ["what-is-money", "what-is-bitcoin"],
    });
  });
});
