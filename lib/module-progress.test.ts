import {
  getCompletedModuleLessonCount,
  getNextModuleLesson,
  isModuleLessonUnlocked,
} from "@/lib/module-progress";
import type { ModuleMeta } from "@/types/lesson";

const moduleData: ModuleMeta = {
  slug: "foundations",
  title: "Foundations",
  description: "Understand the basics before anything else",
  order: 1,
  lessons: [
    {
      slug: "what-is-money",
      title: "What Is Money?",
      summary: "Money basics",
      duration: "8 min",
      order: 1,
      section: "Foundations",
    },
    {
      slug: "what-is-bitcoin",
      title: "What Is Bitcoin?",
      summary: "Bitcoin basics",
      duration: "12 min",
      order: 2,
      section: "Foundations",
    },
    {
      slug: "why-does-bitcoin-matter",
      title: "Why Does Bitcoin Matter?",
      summary: "Bitcoin importance",
      duration: "8 min",
      order: 3,
      section: "Foundations",
    },
  ],
};

describe("module progress helpers", () => {
  it("counts completed lessons inside a module", () => {
    expect(
      getCompletedModuleLessonCount(moduleData, [
        "what-is-money",
        "outside-module",
      ]),
    ).toBe(1);
  });

  it("unlocks lessons sequentially", () => {
    expect(isModuleLessonUnlocked(moduleData, "what-is-money", [])).toBe(true);
    expect(isModuleLessonUnlocked(moduleData, "what-is-bitcoin", [])).toBe(false);
    expect(
      isModuleLessonUnlocked(moduleData, "what-is-bitcoin", ["what-is-money"]),
    ).toBe(true);
  });

  it("returns the next unlocked incomplete lesson or the final lesson when complete", () => {
    expect(getNextModuleLesson(moduleData, []).slug).toBe("what-is-money");
    expect(getNextModuleLesson(moduleData, ["what-is-money"]).slug).toBe(
      "what-is-bitcoin",
    );
    expect(
      getNextModuleLesson(moduleData, [
        "what-is-money",
        "what-is-bitcoin",
        "why-does-bitcoin-matter",
      ]).slug,
    ).toBe("why-does-bitcoin-matter");
  });
});
