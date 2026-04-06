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
      page.getByText("Guest demo · 2 of 3 questions left"),
    ).toBeVisible();
  });

  test("shows the guest limit conversion state on the fourth signed-out question", async ({ page }) => {
    let requestCount = 0;

    await page.route("**/api/chat", async (route) => {
      requestCount += 1;

      if (requestCount <= 3) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            recordedAt: new Date().toISOString(),
            reply: `Tutor reply ${requestCount}`,
            topic: "bitcoin",
            usage: {
              limit: 3,
              plan: "free",
              remaining: 3 - requestCount,
              resetAt: Date.now() + 60_000,
            },
          }),
        });

        return;
      }

      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "You have used the guest AI demo for now. Log in to keep chatting.",
          usage: {
            limit: 3,
            plan: "free",
            remaining: 0,
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

    for (const question of [
      "What is Bitcoin?",
      "How do wallets work?",
      "Why do fees exist?",
      "What is self-custody?",
    ]) {
      await prompt.fill(question);
      await page.getByRole("button", { name: "Ask" }).click();
    }

    await expect(page.getByText("Guest demo · 0 of 3 questions left")).toBeVisible();
    await expect(page.getByText("Guest demo complete")).toBeVisible();
    await expect(
      page.getByText("Create a free account to unlock 10 tutor questions per day"),
    ).toBeVisible();
    const demoPanel = page.locator("#demo");
    await expect(
      demoPanel.getByRole("link", { name: "Create free account" }),
    ).toBeVisible();
    await expect(demoPanel.locator('a[href="/auth/login"]').first()).toBeVisible();
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
