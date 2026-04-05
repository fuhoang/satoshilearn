import { expect, test } from "@playwright/test";

test.describe("happy paths", () => {
  test("opens the guest home chat demo and renders the tutor reply", async ({ page }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          recordedAt: new Date().toISOString(),
          reply: "Bitcoin is digital money that runs on a public network.",
          topic: "bitcoin",
          usage: {
            limit: 3,
            plan: "free",
            remaining: 2,
            resetAt: Date.now() + 60_000,
          },
        }),
      });
    });

    await page.goto("/");
    const prompt = page.locator(
      "#demo input[placeholder='Ask anything about crypto...']:visible",
    );
    await expect(prompt).toBeVisible();
    await prompt.fill("What is Bitcoin?");
    await page.getByRole("button", { name: "Ask" }).click();

    await expect(
      page.getByText("Bitcoin is digital money that runs on a public network."),
    ).toBeVisible();
    await expect(page.getByText("What is Bitcoin?")).toBeVisible();
    await expect(
      page.getByText("Free plan · 2 of 3 guest demo questions left"),
    ).toBeVisible();
  });

  test("navigates into checkout successfully from pricing", async ({ page, baseURL }) => {
    await page.route("**/api/stripe/checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          checkoutUrl: `${baseURL}/learn-crypto`,
        }),
      });
    });

    await page.goto("/pricing");
    await page
      .getByRole("button", { name: /Upgrade to Pro|Upgrade to yearly|Choose yearly/ })
      .first()
      .click();

    await page.waitForURL("**/learn-crypto");
    await expect(page).toHaveURL(/\/learn-crypto$/);
  });
});
