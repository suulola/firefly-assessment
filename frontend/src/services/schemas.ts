import { z, type ZodType } from "zod";
import { reportError } from "@/lib/observability";

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
