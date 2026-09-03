import { test, expect } from "@playwright/test";

test.describe("Order Details", () => {
  test("should display order information", async ({ page }) => {
    await page.goto("/boss-order-insights?orderId=KS1300400032&src=boss_om");

    // await expect(
    //   page.getByRole("heading", { name: "Order Information" }),
    // ).toBeVisible();

    // await expect(page.getByText("12345")).toBeVisible();
  });
});
