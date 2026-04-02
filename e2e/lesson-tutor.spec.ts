import { expect, test, type Page } from "@playwright/test";

async function openTutor(page: Page) {
  await page.goto("/learn/what-is-money");
  await page.getByTestId("lesson-tutor-launcher").click();
  await expect(page.getByRole("button", { name: /close tutor panel/i })).toBeVisible();
  await page.waitForTimeout(350);
}

test.describe("lesson tutor drawer", () => {
  test("resizes the desktop shell when the drawer opens", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only layout assertion.");

    await page.goto("/learn/what-is-money");

    const navbar = page.locator("body > header").first();
    const lessonContent = page.getByTestId("lesson-layout");
    await expect(lessonContent).toBeVisible();

    const beforeNavbar = await navbar.boundingBox();
    const beforeLesson = await lessonContent.boundingBox();

    expect(beforeNavbar).not.toBeNull();
    expect(beforeLesson).not.toBeNull();

    await page.getByTestId("lesson-tutor-launcher").click();
    await expect(page.locator("body")).toHaveClass(/lesson-tutor-open/);
    await expect(page.getByRole("button", { name: /close tutor panel/i })).toBeVisible();
    await page.waitForTimeout(350);

    const drawer = page.getByTestId("lesson-tutor-drawer");
    const afterNavbar = await navbar.boundingBox();
    const afterLesson = await lessonContent.boundingBox();
    const drawerBox = await drawer.boundingBox();
    const viewport = page.viewportSize();

    expect(afterNavbar).not.toBeNull();
    expect(afterLesson).not.toBeNull();
    expect(drawerBox).not.toBeNull();
    expect(viewport).not.toBeNull();

    expect(afterNavbar!.width).toBeLessThan(beforeNavbar!.width - 100);
    expect(afterLesson!.width).toBeLessThan(beforeLesson!.width - 100);
    expect(Math.abs((drawerBox?.height ?? 0) - (viewport?.height ?? 0))).toBeLessThanOrEqual(2);
  });

  test("keeps the mobile lesson width stable while the drawer overlays", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only layout assertion.");

    await page.goto("/learn/what-is-money");

    const lessonContent = page.getByTestId("lesson-layout");
    await expect(lessonContent).toBeVisible();
    const beforeLesson = await lessonContent.boundingBox();

    expect(beforeLesson).not.toBeNull();

    await openTutor(page);

    const afterLesson = await lessonContent.boundingBox();

    expect(afterLesson).not.toBeNull();
    expect(Math.abs(afterLesson!.width - beforeLesson!.width)).toBeLessThanOrEqual(2);
  });
});
