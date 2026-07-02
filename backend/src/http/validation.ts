import { BadRequestError } from "@/http/errors.js";

const FIRST_GENERATION_TOTAL = 150;

function parseInteger(value: unknown, field: string): number {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BadRequestError(`${field} must be an integer.`);
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new BadRequestError(`${field} must be an integer.`);
  }
  return parsed;
}

export function parseOptionalNonNegativeInteger(
  value: unknown,
  field: string,
  defaultValue: number,
): number {
  if (value == null) return defaultValue;
  if (Array.isArray(value)) {
    throw new BadRequestError(`${field} must be an integer.`);
  }
  const parsed = parseInteger(value, field);
  if (parsed < 0) {
    throw new BadRequestError(`${field} must be non-negative.`);
  }
  return parsed;
}

export function parsePositiveInteger(value: unknown, field: string): number {
  if (Array.isArray(value)) {
    throw new BadRequestError(`${field} must be an integer.`);
  }
  const parsed = parseInteger(value, field);
  if (parsed <= 0) {
    throw new BadRequestError(`${field} must be a positive integer.`);
  }
  return parsed;
}

export function parseFavoriteBody(body: unknown): { id: number } {
  if (typeof body !== "object" || body === null || !("id" in body)) {
    throw new BadRequestError("id must be a positive integer.");
  }
  const id = (body as { id: unknown }).id;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new BadRequestError("id must be a positive integer.");
  }
  return { id };
}

export function validateListQuery(query: {
  limit?: unknown;
  offset?: unknown;
}): { limit: number; offset: number } {
  const limit = parseOptionalNonNegativeInteger(query.limit, "limit", 30);
  const offset = parseOptionalNonNegativeInteger(query.offset, "offset", 0);
  if (limit === 0) {
    throw new BadRequestError("limit must be a positive integer.");
  }
  return {
    limit: Math.min(limit, FIRST_GENERATION_TOTAL),
    offset: Math.min(offset, FIRST_GENERATION_TOTAL),
  };
}
