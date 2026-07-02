import { z, type ZodType } from "zod";
import { reportError } from "@/lib/observability";

// Schemas for the *unwrapped* `data` payload only — the envelope itself
// ({ success, data, message }) is readApiResponse's concern, not this file's.

export const pokemonListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  spriteUrl: z.string(),
});

export const pokemonListPageSchema = z.object({
  items: z.array(pokemonListItemSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
});

export const evolutionStageSchema = z.object({
  id: z.number(),
  name: z.string(),
  spriteUrl: z.string(),
});

export const pokemonDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  spriteUrl: z.string(),
  types: z.array(z.string()),
  abilities: z.array(
    z.object({
      name: z.string(),
      hidden: z.boolean(),
    }),
  ),
  evolutions: z.array(evolutionStageSchema),
});

export const favoritesSchema = z.array(z.number());

export const favoriteMutationResponseSchema = z.object({
  id: z.number(),
});

// The envelope already came back well-formed (readApiResponse's job) — this
// validates that the `data` it carried actually matches the shape a service
// promises its callers. A mismatch here means the backend and frontend have
// drifted out of sync, which is a bug worth surfacing distinctly from an
// ordinary network/HTTP failure.
export function parsePayload<T>(
  schema: ZodType<T>,
  data: unknown,
  errorMessage: string,
  source: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    reportError(result.error, {
      source,
      action: "schema-validation",
      extra: { issues: result.error.issues },
    });
    throw new Error(errorMessage);
  }
  return result.data;
}
