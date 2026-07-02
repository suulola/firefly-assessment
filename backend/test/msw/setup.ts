import { afterAll, afterEach, beforeAll } from "vitest";
import { mswServer } from "./server.js";
import { clearPokeApiCache } from "@/modules/pokemon/repository.js";

beforeAll(() =>
  mswServer.listen({
    onUnhandledRequest: (req, print) => {
      // supertest drives requests to the app-under-test over real loopback
      // sockets; msw sees those too, but only PokéAPI calls should be mocked.
      if (req.url.includes("pokeapi.co")) {
        print.error();
      }
    },
  }),
);
afterEach(() => {
  clearPokeApiCache();
  mswServer.resetHandlers();
});
afterAll(() => mswServer.close());
