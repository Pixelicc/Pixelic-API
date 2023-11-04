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
    "/v1/stats/redis": {
      get: {
        tags: ["Status & Stats"],
        summary: "Redis Stats",
        operationId: "getRedisStats",
        responses: {
          "200": {
            description: "Successfully retrieved Redis Stats.",
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
                    bytesStored: {
                      type: "number",
                      example: 346536888,
                    },
                    bytesStoredFormatted: {
                      type: "string",
                      example: "346.54MB",
                    },
                    keys: {
                      type: "number",
                      example: 99046,
                    },
                    keysFormatted: {
                      type: "string",
                      example: "99.05k",
                    },
                    averageKeySize: {
                      type: "number",
                      example: 3498.7469256709005,
                    },
                    averageKeySizeFormatted: {
                      type: "string",
                      example: "3.5KB",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/v1/stats/mongo": {
      get: {
        tags: ["Status & Stats"],
        summary: "Mongo Stats",
        operationId: "getMongoStats",
        responses: {
          "200": {
            description: "Successfully retrieved Mongo Stats.",
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
                    collections: {
                      type: "number",
                      example: 21,
                    },
                    documents: {
                      type: "number",
                      example: 106366,
                    },
                    documentsFormatted: {
                      type: "string",
                      example: "106.37k",
                    },
                    averageDocumentSize: {
                      type: "number",
                      example: 70115.59198132738,
                    },
                    averageDocumentSizeFormatted: {
                      type: "string",
                      example: "70.12KB",
                    },
                    bytesStored: {
                      type: "number",
                      example: 221626368,
                    },
                    bytesStoredFormatted: {
                      type: "string",
                      example: "221.63MB",
                    },
                    databases: {
                      type: "object",
                      properties: {
                        "DB-NAME": {
                          type: "object",
                          properties: {
                            collections: {
                              type: "number",
                              example: 21,
                            },
                            documents: {
                              type: "number",
                              example: 106366,
                            },
                            documentsFormatted: {
                              type: "string",
                              example: "106.37k",
                            },
                            averageDocumentSize: {
                              type: "number",
                              example: 70115.59198132738,
                            },
                            averageDocumentSizeFormatted: {
                              type: "string",
                              example: "70.12KB",
                            },
                            bytesStored: {
                              type: "number",
                              example: 221626368,
                            },
                            bytesStoredFormatted: {
                              type: "string",
                              example: "221.63MB",
                            },
                          },
                        },
                      },
                      example: {
                        API: {
                          collections: 1,
                          documents: 1,
                          documentsFormatted: "1",
                          averageDocumentSize: 45040,
                          averageDocumentSizeFormatted: "45.04KB",
                          bytesStored: 53248,
                          bytesStoredFormatted: "53.25KB",
                        },
                        Hypixel: {
                          collections: 11,
                          documents: 69568,
                          documentsFormatted: "69.57k",
                          averageDocumentSize: 7312.638914443422,
                          averageDocumentSizeFormatted: "7.31KB",
                          bytesStored: 114593792,
                          bytesStoredFormatted: "114.59MB",
                        },
                        Minecraft: {
                          collections: 3,
                          documents: 182,
                          documentsFormatted: "182",
                          averageDocumentSize: 10977.016483516483,
                          averageDocumentSizeFormatted: "10.98KB",
                          bytesStored: 651264,
                          bytesStoredFormatted: "651.26KB",
                        },
                        Wynncraft: {
                          collections: 6,
                          documents: 36615,
                          documentsFormatted: "36.62k",
                          averageDocumentSize: 6785.936583367472,
                          averageDocumentSizeFormatted: "6.79KB",
                          bytesStored: 106328064,
                          bytesStoredFormatted: "106.33MB",
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
    },
    "/v1/user": {
      get: {
        tags: ["User & Usage"],
        summary: "User",
        description: "Retrieve all data we store about you.",
        operationId: "getUser",
        security: [
          {
            "API-Key": [],
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved User.",
            headers: {
              "X-Server-ID": {
                $ref: "#/components/headers/X-Server-ID",
              },
              "X-Request-ID": {
                $ref: "#/components/headers/X-Request-ID",
              },
              "X-RateLimit-Limit": {
                $ref: "#/components/headers/X-RateLimit-Limit",
              },
              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/X-RateLimit-Remaining",
              },
              "X-RateLimit-Reset": {
                $ref: "#/components/headers/X-RateLimit-Reset",
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
                    role: {
                      type: "string",
                      enum: ["USER", "STAFF", "ADMIN"],
                      example: "STAFF",
                    },
                    scopes: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "string",
                      },
                      example: ["hypixel:queryAuctions"],
                    },
                    discordAccount: {
                      type: "object",
                      properties: {
                        ID: {
                          type: "Snowflake",
                          example: "619208257721860108",
                        },
                      },
                    },
                    linkedAccounts: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                      },
                    },
                    totalRequests: {
                      type: "number",
                      example: 416,
                    },
                    usageHistory: {
                      type: "object",
                      properties: {
                        "YYYY-MM-DD": { type: "number" },
                      },
                      example: {
                        "2023-10-20": 411,
                        "2023-10-21": 4,
                        "2023-11-04": 1,
                      },
                    },
                    IPHistory: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "string",
                      },
                      example: ["1.1.1.1"],
                    },
                    requestHistory: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          "ID ": {
                            type: "ULID",
                            example: "01HD6XP00PS397G7V5AK57MYGC",
                          },
                          "URL ": {
                            type: "string",
                            example: "/v1/user",
                          },
                          "method ": {
                            type: "string",
                            example: "GET",
                          },
                          "userAgent ": {
                            type: "string",
                            example: "PostmanRuntime/7.33.0",
                          },
                          "IP ": {
                            type: "string",
                            example: "1.1.1.1",
                          },
                          "timestamp ": {
                            type: "number",
                            example: 1697818279,
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
      },
    },
    "/v1/user/usage": {
      get: {
        tags: ["User & Usage"],
        summary: "Usage",
        operationId: "getUsage",
        security: [
          {
            "API-Key": [],
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Usage.",
            headers: {
              "X-Server-ID": {
                $ref: "#/components/headers/X-Server-ID",
              },
              "X-Request-ID": {
                $ref: "#/components/headers/X-Request-ID",
              },
              "X-RateLimit-Limit": {
                $ref: "#/components/headers/X-RateLimit-Limit",
              },
              "X-RateLimit-Remaining": {
                $ref: "#/components/headers/X-RateLimit-Remaining",
              },
              "X-RateLimit-Reset": {
                $ref: "#/components/headers/X-RateLimit-Reset",
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
                    totalRequests: {
                      type: "number",
                      example: 416,
                    },
                    usageHistory: {
                      type: "object",
                      properties: {
                        "YYYY-MM-DD": { type: "number" },
                      },
                      example: {
                        "2023-10-20": 411,
                        "2023-10-21": 4,
                        "2023-11-04": 1,
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
  },
};
