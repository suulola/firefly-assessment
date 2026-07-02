import type { CorsOptions } from "cors";

// Vite's default dev server origin, allowed out of the box so local
// development works without setting CORS_ORIGIN.
const DEV_DEFAULT_ORIGIN = "http://localhost:5173";

// Deliberately narrower than the task's literal "wildcard if unconfigured"
// suggestion: falling back to `*` on a missing env var would silently expose
// the mutating /favorites endpoints to any origin on a misconfigured
// deployment. Falling back to the known dev origin instead means an
// unconfigured production deploy fails closed (blocks the real frontend
// until CORS_ORIGIN is set) rather than failing open.
export function buildCorsOptions(corsOriginEnv: string | undefined): CorsOptions {
  const configuredOrigins = (corsOriginEnv ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Always pass an array, even for a single origin: the `cors` package
  // treats a bare string as "always send this exact header," not "validate
  // the request's Origin against this value." An array makes it actually
  // check the incoming Origin and only reflect it back on a match.
  if (configuredOrigins.length === 0) {
    return { origin: [DEV_DEFAULT_ORIGIN] };
  }

  return { origin: configuredOrigins };
}
