import { afterAll, afterEach, beforeAll } from "vitest";
import { mswServer } from "./server.js";

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
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());
