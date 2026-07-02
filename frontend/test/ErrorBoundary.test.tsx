import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { resetErrorSink, setErrorSink } from "../src/lib/observability";

function Bomb(): React.ReactNode {
  throw new Error("kaboom");
}

afterEach(() => {
  resetErrorSink();
});

describe("ErrorBoundary", () => {
  it("renders children normally when nothing throws", () => {
    render(
      <ErrorBoundary fallback={(error) => <div>Fallback: {error.message}</div>}>
        <div>All good</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders the fallback instead of crashing when a child throws during render", () => {
    // React logs the caught error to console.error in dev mode; this is
    // expected here and would otherwise be noisy test output.
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={(error) => <div>Something broke: {error.message}</div>}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something broke: kaboom")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("reports the caught error through the observability abstraction, not a direct console.error call", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const errorSink = vi.fn();
    setErrorSink(errorSink);

    render(
      <ErrorBoundary
        source="TestPanel"
        fallback={(error) => <div>Something broke: {error.message}</div>}
      >
        <Bomb />
      </ErrorBoundary>,
    );

    expect(errorSink).toHaveBeenCalledTimes(1);
    const [reportedError, context] = errorSink.mock.calls[0];
    expect(reportedError).toBeInstanceOf(Error);
    expect((reportedError as Error).message).toBe("kaboom");
    expect(context).toMatchObject({ source: "TestPanel", action: "render" });

    consoleSpy.mockRestore();
  });

  it("does not blank a sibling tree when only one boundary's child crashes", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <div>
        <ErrorBoundary fallback={(error) => <div>Broke: {error.message}</div>}>
          <Bomb />
        </ErrorBoundary>
        <ErrorBoundary fallback={(error) => <div>Broke: {error.message}</div>}>
          <div>Still here</div>
        </ErrorBoundary>
      </div>,
    );

    expect(screen.getByText("Broke: kaboom")).toBeInTheDocument();
    expect(screen.getByText("Still here")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("re-renders children after reset is called from the fallback", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let shouldThrow = true;
    function MaybeBomb() {
      if (shouldThrow) throw new Error("kaboom");
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <div>
            <div>Broke: {error.message}</div>
            <button onClick={reset}>Retry</button>
          </div>
        )}
      >
        <MaybeBomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Broke: kaboom")).toBeInTheDocument();

    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByText("Recovered")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
