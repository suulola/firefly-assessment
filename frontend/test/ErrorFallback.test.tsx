import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorFallback } from "../src/components/ErrorFallback";

describe("ErrorFallback", () => {
  it("renders the message and autofocuses the retry button so it's immediately reachable", () => {
    render(<ErrorFallback message="Something broke." onRetry={vi.fn()} />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toHaveFocus();
    expect(screen.getByText("Something broke.")).toBeInTheDocument();
  });

  it("calls onRetry when the retry button is clicked", async () => {
    const onRetry = vi.fn();
    render(<ErrorFallback message="Something broke." onRetry={onRetry} />);

    screen.getByRole("button", { name: /retry/i }).click();

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
