import { expect, test } from "@playwright/test";

test.describe("failure feedback", () => {
  test("shows a billing availability message on checkout failure", async ({ page }) => {
    await page.route("**/api/stripe/checkout", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Billing is temporarily unavailable. Please try again shortly.",
        }),
      });
    });

    await page.goto("/pricing");
    await page.getByRole("button", { name: "Upgrade to Pro" }).click();

    await expect(
      page.getByText("Billing is temporarily unavailable. Please try again shortly."),
    ).toBeVisible();
  });

  test("shows the tutor rate-limit message in the lesson drawer", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "You have reached the tutor limit for now. Please try again in a minute.",
        }),
      });
    });

    await page.goto("/learn/what-is-money");
    await page.getByTestId("lesson-tutor-launcher").click();
    await expect(
      page.getByRole("button", { name: /close tutor panel/i }),
    ).toBeVisible();

    await page.getByPlaceholder("Ask about this lesson...").fill("What is Bitcoin?");
    await page.getByRole("button", { name: "Ask" }).click();

    await expect(
      page.getByText("You have reached the tutor limit for now. Please try again in a minute."),
    ).toBeVisible();
  });

  test("shows a temporary tutor outage message in the lesson drawer", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "The tutor is temporarily unavailable. Please try again shortly.",
        }),
      });
    });

    await page.goto("/learn/what-is-money");
    await page.getByTestId("lesson-tutor-launcher").click();
    await expect(
      page.getByRole("button", { name: /close tutor panel/i }),
    ).toBeVisible();

    await page.getByPlaceholder("Ask about this lesson...").fill("Summarize this lesson");
    await page.getByRole("button", { name: "Ask" }).click();

    await expect(
      page.getByText("The tutor is temporarily unavailable. Please try again shortly."),
    ).toBeVisible();
  });
});
