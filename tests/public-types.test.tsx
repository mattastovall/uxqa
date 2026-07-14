import type { ComponentProps } from "react";
import { expect, it } from "vitest";
import { BrowserSimulator } from "../src/index.js";

const validSource = <BrowserSimulator src="/preview" />;
const validContent = <BrowserSimulator content={<main>Preview</main>} />;
const validControlled = <BrowserSimulator src="/" selection={{ deviceId: "pixel", browserId: "chrome", chrome: "auto" }} onSelectionChange={() => undefined} />;

// @ts-expect-error src and content are mutually exclusive
const invalidSource = <BrowserSimulator src="/" content={<main />} />;
// @ts-expect-error controlled selection requires a change callback
const invalidControlled = <BrowserSimulator src="/" selection={{ deviceId: "pixel", browserId: "chrome", chrome: "auto" }} />;

type PublicProps = ComponentProps<typeof BrowserSimulator>;
const publicProps: PublicProps = { src: "/", controls: { device: true, browser: false, chrome: true } };
const compactProps: PublicProps = { src: "/", controlVariant: "compact" };

void [validSource, validContent, validControlled, invalidSource, invalidControlled, publicProps, compactProps];

it("keeps the public prop contracts type checked", () => {
  expect(publicProps.src).toBe("/");
});
