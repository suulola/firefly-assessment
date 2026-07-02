export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Firefly Pokémon Assessment API",
    version: "1.0.0",
  },
  paths: {
    "/health": {
      get: {
        summary: "Backend liveness check",
        responses: {
          "200": { description: "Backend is alive" },
        },
      },
    },
    "/health/pokeapi": {
      get: {
        summary: "PokéAPI reachability check",
        responses: {
          "200": { description: "PokéAPI is reachable" },
          "502": { description: "PokéAPI is unreachable" },
        },
      },
    },
    "/health/ready": {
      get: {
        summary: "Backend readiness check",
        responses: {
          "200": { description: "Backend is ready" },
          "503": { description: "Backend is not ready" },
        },
      },
    },
    "/pokemon": {
      get: {
        summary: "List first-generation Pokémon",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 150 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, maximum: 150 } },
        ],
        responses: {
          "200": { description: "Pokémon list loaded" },
          "400": { description: "Invalid query" },
          "502": { description: "Upstream failure" },
        },
      },
    },
    "/pokemon/{id}": {
      get: {
        summary: "Get Pokémon detail",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
        ],
        responses: {
          "200": { description: "Pokémon loaded" },
          "400": { description: "Invalid id" },
          "502": { description: "Upstream failure" },
        },
      },
    },
    "/favorites": {
      get: {
        summary: "List favorites",
        responses: {
          "200": { description: "Favorites loaded" },
          "500": { description: "Storage failure" },
        },
      },
      post: {
        summary: "Add favorite",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: { id: { type: "integer", minimum: 1 } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Favorite saved" },
          "400": { description: "Invalid body" },
          "500": { description: "Storage failure" },
        },
      },
    },
    "/favorites/{id}": {
      delete: {
        summary: "Remove favorite",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
        ],
        responses: {
          "200": { description: "Favorite removed" },
          "400": { description: "Invalid id" },
          "500": { description: "Storage failure" },
        },
      },
    },
    "/openapi.json": {
      get: {
        summary: "OpenAPI contract",
        responses: {
          "200": { description: "OpenAPI JSON document" },
        },
      },
    },
  },
} as const;
