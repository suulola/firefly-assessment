import { useEffect, useState } from "react";
import { getBackendHealth } from "./lib/backendClient";

type BackendStatus = "checking" | "ok" | "unreachable";

export function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    getBackendHealth()
      .then(() => {
        if (!cancelled) setBackendStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setBackendStatus("unreachable");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <h1>Pokémon Explorer</h1>
      <p>Backend status: {backendStatus}</p>
    </main>
  );
}
