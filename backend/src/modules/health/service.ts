import { pokeApiGet } from "@/modules/pokemon/repository.js";

export function checkLiveness(): { status: "ok" } {
  return { status: "ok" };
}

export async function checkPokeApiReachable(): Promise<
  { reachable: true } | { reachable: false }
> {
  try {
    await pokeApiGet("/pokemon/1");
    return { reachable: true };
  } catch {
    return { reachable: false };
  }
}
