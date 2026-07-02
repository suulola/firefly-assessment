import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { mswServer } from "./msw/server";

// jsdom doesn't do real layout, so every element reports 0 for offsetHeight.
// @tanstack/react-virtual reads that once at mount (this jsdom version has
// no ResizeObserver, so it never remeasures) to size its viewport — without
// a non-zero default, its visible-row window would be empty everywhere.
// Individual tests can still override clientHeight/scrollHeight/scrollTop
// per-instance (see PokemonList.test.tsx's scroll test) — that's a separate
// set of properties this doesn't touch.
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  value: 600,
});
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  value: 400,
});

beforeAll(() => mswServer.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
});
afterAll(() => mswServer.close());
