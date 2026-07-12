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

test("ships the complete custom chrome and keeps its default appearance stable", async ({ page }) => {
  const example = page.locator("section").first();
  const chrome = example.locator('.uxqa-browser-chrome[data-appearance="ios26-safari"]');

  await expect(chrome.locator('[data-icon="signal"]')).toBeVisible();
  await expect(chrome.locator('[data-icon="wifi"]')).toBeVisible();
  await expect(chrome.locator(".uxqa-ios26-page-menu")).toBeVisible();
  await expect(chrome.locator(".uxqa-ios26-reload")).toBeVisible();
  await expect(example.locator(".uxqa-screen")).toHaveScreenshot("default-ios26-safari.png", {
    animations: "disabled",
    maxDiffPixels: 100,
  });
  await example.frameLocator("iframe").locator("html").evaluate((element) => element.ownerDocument.defaultView?.scrollTo(0, 180));
  await expect(chrome).toHaveAttribute("data-chrome-state", "collapsed");
  await expect(example.locator(".uxqa-screen")).toHaveScreenshot("collapsed-ios26-safari.png", {
    animations: "disabled",
    maxDiffPixels: 100,
  });
});
