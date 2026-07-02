import type { CorsOptions } from "cors";

const DEV_DEFAULT_ORIGIN = "http://localhost:5173";

export function buildCorsOptions(corsOriginEnv: string | undefined): CorsOptions {
  const configuredOrigins = (corsOriginEnv ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) {
    return { origin: [DEV_DEFAULT_ORIGIN] };
  }

  return { origin: configuredOrigins };
}
