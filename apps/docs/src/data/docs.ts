export default {
  openapi: "3.1.0",
  info: {
    title: "Documentation",
    description:
      "# Introduction\nThis is the official Pixelic-API documentation. The Pixelic-API provides Minecraft related data.\n\nPowered by: `TypeScript` `MongoDB` `Redis` `Cloudflare`\n\n## Limits\n\nThe API has a ratelimit of **60 requests/minute** per API-Key by default. Hitting an cached endpoint **DOES NOT** count towards the rate limit.\n\nEndpoints which require the usage of an API-Key will also respond with headers to assist with managing the ratelimit:\n- `X-RateLimit-Limit` - The limit of requests per period for the provided API-Key.\n- `X-RateLimit-Remaining` - The remaining amount of requests allowed for the current period.\n- `X-RateLimit-Reset` - The amount of seconds until the next period and the reset of the API-Key usage.\n\n## Rules\n\n**Usage of this API requires giving credit!**\n\n**Any abuse of the API will lead to your API key being reset/banned.**\n## Notes\n\n### Cached Responses\nMost endpoints will be cached by Cloudflare for faster response times. Hitting an cached Endpoint can be seen via the `CF-Cache-Status` Header.\n\n### UUIDs\nUUIDs are stored/returned without dashes.\n\n### Hypixel Skyblock IDs\nCustom Skyblock IDs are used for Pets, Potions and Runes eg. PET_ELEPHANT, POTION_SPEED & RUNE_MAGIC \n\n### Dates and Time\nTimestamps are stored/returned as Unix timestamps in seconds.\n\n# Authentication\n\n<!-- ReDoc-Inject: <security-definitions> -->",
    /**
     * TODO: Add ToS
     */
    termsOfService: "",
  },
  servers: [
    {
      url: "https://api.pixelic.de/",
    },
  ],
  components: {
    securitySchemes: {
      "API-Key": {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      },
    },
    headers: {
      "X-Server-ID": {
        description: "Server-ID of the server which served this request.",
        schema: {
          type: "ULID",
        },
      },
      "X-Request-ID": {
        description: "Unique ID linked to this request.",
        schema: {
          type: "ULID",
        },
      },
      "X-RateLimit-Limit": {
        description: "The number of requests allowed in the current period.",
        schema: {
          type: "integer",
        },
      },
      "X-RateLimit-Remaining": {
        description: "The number of requests left in the current period.",
        schema: {
          type: "integer",
        },
      },
      "X-RateLimit-Reset": {
        description: "The time left till the current period ends in seconds.",
        schema: {
          type: "integer",
        },
      },
    },
    /**
     * TODO: Add parameters
     */
    parameters: {},
    /**
     * TODO: Add responses
     */
    responses: {},
  },
  /**
   * TODO: Add paths
   */
  paths: {
    "/health": {
      get: {
        tags: ["Status & Stats"],
        description: "",
        summary: "Health",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "The API is reachable and healthy.",
            headers: {
              "X-Server-ID": {
                $ref: "#/components/headers/X-Server-ID",
              },
              "X-Request-ID": {
                $ref: "#/components/headers/X-Request-ID",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/v1/stats": {
      get: {
        tags: ["Status & Stats"],
        summary: "General Stats",
        operationId: "getGeneralStats",
        responses: {
          "200": {
            description: "Successfully retrieved General Stats.",
            headers: {
              "X-Server-ID": {
                $ref: "#/components/headers/X-Server-ID",
              },
              "X-Request-ID": {
                $ref: "#/components/headers/X-Request-ID",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    requests: {
                      type: "number",
                      example: 1234567,
                    },
                    requestsFormatted: {
                      type: "string",
                      example: "1.23m",
                    },
                    requestsHistory: {
                      type: "object",
                      properties: {
                        "YYYY-MM-DD": {
                          type: "number",
                        },
                      },
                      example: {
                        "2023-10-23": 563,
                        "2023-10-24": 4323,
                        "2023-10-25": 438,
                        "2023-10-27": 1441,
                        "2023-10-28": 1532,
                        "2023-10-29": 198,
                        "2023-10-31": 177,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/v1/stats/code": {
      get: {
        tags: ["Status & Stats"],
        summary: "Code Stats",
        operationId: "getCodeStats",
        responses: {
          "200": {
            description: "Successfully retrieved Code Stats.",
            headers: {
              "X-Server-ID": {
                $ref: "#/components/headers/X-Server-ID",
              },
              "X-Request-ID": {
                $ref: "#/components/headers/X-Request-ID",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    languages: {
                      type: "object",
                      properties: {
                        LANGUAGE: {
                          type: "object",
                          properties: {
                            files: {
                              type: "number",
                              example: 75,
                            },
                            lines: {
                              type: "number",
                              example: 4500,
                            },
                            comments: {
                              type: "number",
                              example: 150,
                            },
                          },
                        },
                      },
                      example: {
                        TypeScript: {
                          files: 79,
                          lines: 5709,
                          comments: 144,
                        },
                        "Vue.js": {
                          files: 3,
                          lines: 176,
                          comments: 9,
                        },
                        JavaScript: {
                          files: 2,
                          lines: 92,
                          comments: 114,
                        },
                        HTML: {
                          files: 1,
                          lines: 14,
                          comments: 0,
                        },
                      },
                    },
                    files: {
                      type: "number",
                      example: 100,
                    },
                    lines: {
                      type: "number",
                      example: 6000,
                    },
                    comments: {
                      type: "number",
                      example: 300,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/v1/stats/repo": {
      get: {
        tags: ["Status & Stats"],
        summary: "Repo Stats",
        operationId: "getRepoStats",
        responses: {
          "200": {
            description: "Successfully retrieved Repo Stats.",
            headers: {
              "X-Server-ID": {
                $ref: "#/components/headers/X-Server-ID",
              },
              "X-Request-ID": {
                $ref: "#/components/headers/X-Request-ID",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    ID: {
                      type: "number",
                      example: 692422613,
                    },
                    name: {
                      type: "string",
                      example: "Pixelic-API",
                    },
                    fullName: {
                      type: "string",
                      example: "Pixelicc/Pixelic-API",
                    },
                    description: {
                      type: "string",
                      example: "An API focused on Minecraft related data",
                    },
                    tags: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "string",
                      },
                      example: ["api", "minecraft", "statistics", "hypixel", "wynncraft"],
                    },
                    owner: {
                      type: "object",
                      properties: {
                        ID: {
                          type: "number",
                          example: 69585766,
                        },
                        username: {
                          type: "string",
                          example: "Pixelicc",
                        },
                      },
                    },
                    created: {
                      type: "number",
                      example: 1694867663,
                    },
                    lastUpdated: {
                      type: "number",
                      example: 1698762684,
                    },
                    lastPushed: {
                      type: "number",
                      example: 1698944037,
                    },
                    watchers: {
                      type: "number",
                      example: 0,
                    },
                    stars: {
                      type: "number",
                      example: 0,
                    },
                    forks: {
                      type: "number",
                      example: 0,
                    },
                    openIssues: {
                      type: "number",
                      example: 0,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
