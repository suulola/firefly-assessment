import { afterEach, describe, expect, it, vi } from "vitest";
import { readApiResponse } from "../src/services/apiResponse";
import { resetErrorSink, setErrorSink } from "../src/lib/observability";

afterEach(() => {
  resetErrorSink();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("readApiResponse", () => {
  it("returns data from a well-formed successful envelope", async () => {
    const response = jsonResponse({ success: true, data: { id: 1 }, message: "OK" });

    await expect(readApiResponse(response, "fallback")).resolves.toEqual({ id: 1 });
  });

  it("throws the envelope's message on a well-formed failure envelope", async () => {
    const response = jsonResponse(
      { success: false, data: null, message: "Failed to load." },
      502,
    );

    await expect(readApiResponse(response, "fallback")).rejects.toThrow("Failed to load.");
  });

  it("returns undefined for a 204 No Content response without parsing a body", async () => {
    const response = new Response(null, { status: 204 });

    await expect(readApiResponse(response, "fallback")).resolves.toBeUndefined();
  });

  it("rejects a response where success is not a boolean", async () => {
    const response = jsonResponse({ success: "yes", data: { id: 1 }, message: "OK" });

    await expect(readApiResponse(response, "fallback")).rejects.toThrow();
  });

  it("rejects a response where message is not a string", async () => {
    const response = jsonResponse({ success: true, data: { id: 1 }, message: null });

    await expect(readApiResponse(response, "fallback")).rejects.toThrow();
  });

  it("rejects a successful envelope with missing data", async () => {
    const response = jsonResponse({ success: true, data: null, message: "OK" });

    await expect(readApiResponse(response, "fallback")).rejects.toThrow();
  });

  it("rejects a raw, unenveloped body instead of silently passing it through", async () => {
    const response = jsonResponse([1, 2, 3]);

    await expect(readApiResponse(response, "fallback")).rejects.toThrow();
  });

  it("falls back to the provided message when the body cannot be parsed as JSON", async () => {
    const response = new Response("not json", { status: 502 });

    await expect(readApiResponse(response, "fallback message")).rejects.toThrow(
      "fallback message",
    );
  });

  it("reports a malformed envelope through observability, tagged with the caller's source", async () => {
    const errorSink = vi.fn();
    setErrorSink(errorSink);
    const response = jsonResponse([1, 2, 3]);

    await expect(readApiResponse(response, "fallback", "testService.doThing")).rejects.toThrow();

    expect(errorSink).toHaveBeenCalledTimes(1);
    const [, context] = errorSink.mock.calls[0];
    expect(context).toMatchObject({
      source: "testService.doThing",
      action: "validate-envelope",
    });
  });

  it("does not report an ordinary, well-formed failure envelope (that's expected, not a bug)", async () => {
    const errorSink = vi.fn();
    setErrorSink(errorSink);
    const response = jsonResponse(
      { success: false, data: null, message: "Failed to load." },
      502,
    );

    await expect(readApiResponse(response, "fallback")).rejects.toThrow("Failed to load.");

    expect(errorSink).not.toHaveBeenCalled();
  });
});
