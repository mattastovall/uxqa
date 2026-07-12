import { expect, test } from "@playwright/test";

let consoleErrors: string[];

test.beforeEach(async ({ page }) => {
  consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");
  await page.locator("section").first().getByText("Preview loaded").waitFor();
});

test.afterEach(() => expect(consoleErrors, "browser console errors").toEqual([]));

test("renders the default simulator and changes visible device and browser chrome", async ({ page }) => {
  const example = page.locator("section").first();
  const screen = example.locator(".uxqa-screen");
  await expect(screen).toHaveAttribute("data-device", "iphone-16");
  await example.getByRole("combobox").nth(0).selectOption("pixel");
  await expect(screen).toHaveAttribute("data-device", "pixel");
  await expect(example.locator('[data-appearance="android-chrome"]')).toBeVisible();
  await example.getByRole("combobox").nth(1).selectOption("instagram");
  await expect(example.locator('[data-appearance="instagram"]')).toBeVisible();
});

test("iframe content stays interactive and same-origin scrolling collapses chrome", async ({ page }) => {
  const example = page.locator("section").first();
  const frame = example.frameLocator("iframe");
  await frame.getByRole("button", { name: "Try interaction" }).click();
  await expect(frame.getByRole("button", { name: "Clicked" })).toBeVisible();
  await frame.locator("html").evaluate((element) => element.ownerDocument.defaultView?.scrollTo(0, 180));
  await expect(example.locator(".uxqa-browser-chrome")).toHaveAttribute("data-chrome-state", "collapsed");
});

test("keyboard focus reaches every default control", async ({ page }) => {
  const example = page.locator("section").first();
  const controls = [example.getByRole("combobox").nth(0), example.getByRole("combobox").nth(1), example.getByRole("checkbox")];
  await controls[0].focus();
  for (const control of controls) {
    await expect(control).toBeFocused();
    await page.keyboard.press("Tab");
  }
});
