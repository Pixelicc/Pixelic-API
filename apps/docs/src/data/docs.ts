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
        description: "To generate an API-Key click here: [CREATE](https://api.pixelic.de/oauth/discord?action=user.create)\n\nTo regenerate your API-Key click here: [REGENERATE](https://api.pixelic.de/oauth/discord?action=user.key.regenerate)",
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
    parameters: {
      player: {
        name: "player",
        in: "path",
        schema: {
          type: "UUID",
        },
      },
    },
    responses: {
      invalidData: {
        description: "Some data provided is invalid!",
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
                  example: false,
                },
                cause: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      accessForbidden: {
        description: "Access is forbidden, usually due to an invalid API-Key being used or it not having the required scopes!",
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
                  example: false,
                },
                cause: {
                  type: "string",
                  enum: ["Invalid API-Key", "Insufficient Permissions"],
                },
                requires: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        role: {
                          oneOf: [
                            {
                              type: "string",
                            },
                            {
                              type: "array",
                              uniqueItems: true,
                              items: {
                                type: "string",
                              },
                            },
                            {
                              type: "undefined",
                            },
                          ],
                        },
                        scope: {
                          oneOf: [
                            {
                              type: "string",
                            },
                            {
                              type: "undefined",
                            },
                          ],
                        },
                      },
                    },
                    {
                      type: "undefined",
                    },
                  ],
                },
              },
            },
          },
        },
      },
      ratelimited: {
        description: "Your API-Key's Request Limit has been exceeded!",
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
                  example: false,
                },
                cause: {
                  type: "string",
                  example: "Ratelimit exceeded",
                },
              },
            },
          },
        },
      },
    },
  },
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
                    indexes: {
                      type: "number",
                      example: 46,
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
                            indexes: {
                              type: "number",
                              example: 46,
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
                          indexes: 3,
                          documents: 1,
                          documentsFormatted: "1",
                          averageDocumentSize: 45040,
                          averageDocumentSizeFormatted: "45.04KB",
                          bytesStored: 53248,
                          bytesStoredFormatted: "53.25KB",
                        },
                        Hypixel: {
                          collections: 11,
                          indexes: 30,
                          documents: 69568,
                          documentsFormatted: "69.57k",
                          averageDocumentSize: 7312.638914443422,
                          averageDocumentSizeFormatted: "7.31KB",
                          bytesStored: 114593792,
                          bytesStoredFormatted: "114.59MB",
                        },
                        Minecraft: {
                          collections: 3,
                          indexes: 3,
                          documents: 182,
                          documentsFormatted: "182",
                          averageDocumentSize: 10977.016483516483,
                          averageDocumentSizeFormatted: "10.98KB",
                          bytesStored: 651264,
                          bytesStoredFormatted: "651.26KB",
                        },
                        Wynncraft: {
                          collections: 6,
                          indexes: 10,
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
                      example: ["hypixel:querySkyblockAuctions"],
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
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
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
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/minecraft/uuids": {
      get: {
        tags: ["Minecraft"],
        summary: "UUID List",
        description: "Returns up to **100,000** UUIDs (**~ 3.34MB**) per page. The most recent/last page is cached for around **15min**, all others are cached as long as possible!",
        operationId: "getMinecraftUUIDList",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              default: 0,
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved UUID List Page.",
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
                    totalPages: {
                      type: "number",
                      example: 1,
                    },
                    currentPage: {
                      type: "number",
                      example: 1,
                    },
                    UUIDs: {
                      type: "array",
                      minItems: 1,
                      maxItems: 100000,
                      uniqueItems: true,
                      items: {
                        type: "UUID",
                      },
                      example: ["14727faefbdc4aff848cd2713eb9939e", "6dd9f4bdffbc4e5f9634c5278782bc11"],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/minecraft/server/list": {
      get: {
        tags: ["Minecraft"],
        summary: "Server List",
        description: "Returns a list of all current online Servers and its Players.",
        operationId: "getMinecraftServerList",
        security: [
          {
            "API-Key": [],
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Server List.",
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
                    servers: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          ID: {
                            type: "string",
                          },
                          name: {
                            type: "string",
                          },
                          host: {
                            type: "string",
                          },
                        },
                      },
                      example: [
                        {
                          ID: "HYPIXEL",
                          host: "mc.hypixel.net",
                          name: "Hypixel",
                        },
                        {
                          ID: "WYNNCRAFT",
                          host: "play.wynncraft.com",
                          name: "Wynncraft",
                        },
                        {
                          ID: "GOMMEHD",
                          host: "play.gommehd.net",
                          name: "GommeHD",
                        },
                        {
                          ID: "CUBECRAFT",
                          host: "play.cubecraft.net",
                          name: "CubeCraft",
                        },
                        {
                          ID: "MINEHUT",
                          host: "minehut.gg",
                          name: "Minehut",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/minecraft/server/{SERVER}": {
      get: {
        tags: ["Minecraft"],
        summary: "Server",
        description: "Returns the specified Server and its Players.",
        operationId: "getMinecraftServer",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "Server",
            in: "path",
            schema: {
              type: "string",
              description: "Minecraft Server ID",
              example: "HYPIXEL",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Server.",
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
                    server: {
                      type: "object",
                      properties: {
                        latency: {
                          type: "number",
                          example: 104,
                        },
                        latencyFormatted: {
                          type: "string",
                          example: "104ms",
                        },
                        maxPlayercount: {
                          type: "number",
                          example: 200000,
                        },
                        maxPlayercountFormatted: {
                          type: "number",
                          example: "200k",
                        },
                        playercount: {
                          type: "number",
                          example: 35243,
                        },
                        playercountFormatted: {
                          type: "string",
                          example: "35.24k",
                        },
                        MOTD: {
                          oneOf: [
                            {
                              type: "string",
                            },
                            {
                              type: "object",
                            },
                          ],
                          example: "                §aHypixel Network §c[1.8-1.20]\n  §6§lSKYBLOCK 0.19.7 §e§lPESTS §7- §b§lHOUSING UPDATE",
                        },
                        icon: {
                          type: "string",
                          example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaX (...15.6 KB)",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/minecraft/server/{SERVER}/history": {
      get: {
        tags: ["Minecraft"],
        summary: "Server History",
        description: "Returns the Server's alltime playercount and latency history.",
        operationId: "getMinecraftServerHistory",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "Server",
            in: "path",
            schema: {
              type: "string",
              description: "Minecraft Server ID",
              example: "HYPIXEL",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Server History.",
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
                    history: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          playercount: {
                            type: "number",
                          },
                          latency: {
                            type: "number",
                          },
                          timestamp: {
                            type: "number",
                          },
                        },
                      },
                      example: [
                        {
                          playercount: 36477,
                          latency: 104,
                          timestamp: 1699301070,
                        },
                        {
                          playercount: 24416,
                          latency: 104,
                          timestamp: 1699362947,
                        },
                        {
                          playercount: 27971,
                          latency: 119,
                          timestamp: 1699366590,
                        },
                        {
                          playercount: 30909,
                          latency: 113,
                          timestamp: 1699370190,
                        },
                        {
                          playercount: 21947,
                          latency: 105,
                          timestamp: 1699446870,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/minecraft/server/{SERVER}/history/{TIMEFRAME}": {
      get: {
        tags: ["Minecraft"],
        summary: "Server Alltime History",
        description: "Returns the Server's playercount and latency history for the specified timeframe.",
        operationId: "getMinecraftServerHistoryByTimeframe",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "Server",
            in: "path",
            schema: {
              type: "string",
              description: "Minecraft Server ID",
              example: "HYPIXEL",
            },
          },
          {
            name: "timeframe",
            in: "path",
            schema: {
              type: "string",
              enum: ["hour", "day", "week", "month", "year"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Server History.",
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
                    history: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          playercount: {
                            type: "number",
                          },
                          latency: {
                            type: "number",
                          },
                          timestamp: {
                            type: "number",
                          },
                        },
                      },
                      example: [
                        {
                          playercount: 36477,
                          latency: 104,
                          timestamp: 1699301070,
                        },
                        {
                          playercount: 24416,
                          latency: 104,
                          timestamp: 1699362947,
                        },
                        {
                          playercount: 27971,
                          latency: 119,
                          timestamp: 1699366590,
                        },
                        {
                          playercount: 30909,
                          latency: 113,
                          timestamp: 1699370190,
                        },
                        {
                          playercount: 21947,
                          latency: 105,
                          timestamp: 1699446870,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/player/{PLAYER}": {
      get: {
        tags: ["Hypixel"],
        summary: "Player",
        description: "Returns the latest player data.\n\n**MAY NOT BE UP TO DATE**",
        operationId: "getHypixelPlayer",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            $ref: "#/components/parameters/player",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Player.",
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
                    player: {
                      type: "object",
                      properties: {
                        UUID: {
                          type: "UUID",
                          example: "14727faefbdc4aff848cd2713eb9939e",
                        },
                        username: {
                          type: "string",
                          example: "Pixelic",
                        },
                        APISettings: {
                          type: "object",
                          properties: {
                            onlineStatus: {
                              type: "boolean",
                            },
                            winstreaks: {
                              type: "boolean",
                            },
                          },
                        },
                        EXP: {
                          type: "number",
                          example: 46016605,
                        },
                        achievementPoints: {
                          type: "number",
                          example: 7145,
                        },
                        challengesCompleted: {
                          type: "number",
                          example: 2171,
                        },
                        chatChannel: {
                          type: "string",
                          enum: ["ALL", "PARTY", "GUILD", "OFFICER", "SKYBLOCK_COOP", "PM"],
                        },
                        firstLogin: {
                          type: "number",
                          example: 1496234626,
                        },
                        giftsReceived: {
                          type: "number",
                          example: 11,
                        },
                        giftsSent: {
                          type: "number",
                          example: 15,
                        },
                        karma: {
                          type: "number",
                          example: 37403863,
                        },
                        language: {
                          type: "string",
                          enum: ["ENGLISH", "SERBIAN_CYRILLIC", "FRENCH", "POLISH", "PIRATE", "GERMAN", "ITALIAN", "SPANISH", "CHINESE_SIMPLIFIED", "CHINESE_TRADITIONAL", "PORTUGUESE_PT", "RUSSIAN", "UKRAINIAN", "KOREAN", "PORTUGUESE_BR", "DUTCH", "TURKISH", "FINNISH", "JAPANESE", "CZECH", "NORWEGIAN", "HUNGARIAN", "SWEDISH", "ROMANIAN", "DANISH", "GREEK"],
                        },
                        lastLogin: {
                          type: "number",
                          example: 1699446906,
                        },
                        lastLogout: {
                          type: "number",
                          example: 1699373578,
                        },
                        lastModePlayed: {
                          oneOf: [
                            {
                              type: "string",
                            },
                            { type: "null" },
                          ],
                          example: "BEDWARS",
                        },
                        level: {
                          type: "number",
                          example: 189.39980198009582,
                        },
                        online: {
                          type: "boolean",
                        },
                        plusColor: {
                          oneOf: [
                            {
                              type: "string",
                              enum: ["RED", "GOLD", "GREEN", "YELLOW", "LIGHT_PURPLE", "WHITE", "BLUE", "DARK_GREEN", "DARK_RED", "DARK_AQUA", "DARK_PURPLE", "DARK_GRAY", "BLACK", "DARK_BLUE"],
                            },
                            { type: "null" },
                          ],
                          example: "LIGHT_PURPLE",
                        },
                        plusPlusColor: {
                          oneOf: [
                            {
                              type: "string",
                              enum: ["GOLD", "AQUA"],
                            },
                            { type: "null" },
                          ],
                          example: "AQUA",
                        },
                        questsCompleted: {
                          type: "number",
                          example: 1329,
                        },
                        rank: {
                          oneOf: [
                            {
                              type: "string",
                              enum: ["VIP", "VIP_PLUS", "MVP", "MVP_PLUS", "MVP_PLUS_PLUS", "PIG_PLUS_PLUS_PLUS", "YOUTUBER", "GAME_MASTER", "ADMIN", "OWNER"],
                            },
                            { type: "null" },
                          ],
                          example: "MVP_PLUS_PLUS",
                        },
                        ranksGifted: {
                          type: "number",
                          example: 21,
                        },
                        rewards: {
                          type: "object",
                          properties: {
                            streak: {
                              type: "number",
                              example: 2,
                            },
                            highestStreak: {
                              type: "number",
                              example: 71,
                            },
                            claimedTotal: {
                              type: "number",
                              example: 492,
                            },
                            claimedDaily: {
                              type: "number",
                              example: 430,
                            },
                            tokens: {
                              type: "number",
                              example: 0,
                            },
                          },
                        },
                        socialMedia: {
                          type: "object",
                          properties: {
                            HYPIXEL: {
                              oneOf: [{ type: "string" }, { type: "null" }],
                              example: null,
                            },
                            DISCORD: {
                              oneOf: [{ type: "string" }, { type: "null" }],
                              example: "Pixelic",
                            },
                            YOUTUBE: {
                              oneOf: [{ type: "string" }, { type: "null" }],
                              example: null,
                            },
                            TWITCH: {
                              oneOf: [{ type: "string" }, { type: "null" }],
                              example: null,
                            },
                            TWITTER: {
                              oneOf: [{ type: "string" }, { type: "null" }],
                              example: null,
                            },
                            INSTAGRAM: {
                              oneOf: [{ type: "string" }, { type: "null" }],
                              example: null,
                            },
                            TIKTOK: {
                              oneOf: [{ type: "string" }, { type: "null" }],
                              example: null,
                            },
                          },
                        },
                        tourney: {
                          type: "object",
                          properties: {
                            tributes: {
                              type: "number",
                              example: 100,
                            },
                          },
                        },
                        stats: {
                          type: "object",
                          properties: {
                            Bedwars: {
                              type: "object",
                            },
                            Skywars: {
                              type: "object",
                            },
                            Duels: {
                              type: "object",
                            },
                            Skyblock: {
                              type: "object",
                            },
                            Arcade: {
                              type: "object",
                            },
                            Arena: {
                              type: "object",
                            },
                            Warlords: {
                              type: "object",
                            },
                            BuildBattle: {
                              type: "object",
                            },
                            TKR: {
                              type: "object",
                            },
                            MurderMystery: {
                              type: "object",
                            },
                            Pit: {
                              type: "object",
                            },
                            TNT: {
                              type: "object",
                            },
                            Blitz: {
                              type: "object",
                            },
                            CvC: {
                              type: "object",
                            },
                            Paintball: {
                              type: "object",
                            },
                            Quake: {
                              type: "object",
                            },
                            SpeedUHC: {
                              type: "object",
                            },
                            Smash: {
                              type: "object",
                            },
                            Walls: {
                              type: "object",
                            },
                            MegaWalls: {
                              type: "object",
                            },
                            VampireZ: {
                              type: "object",
                            },
                            Woolwars: {
                              type: "object",
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
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/player/{PLAYER}/history": {
      get: {
        tags: ["Hypixel"],
        summary: "Player History",
        description: "Returns alltime history of the specified Player. The returned data only shows object keys which have changed between the datapoints.",
        operationId: "getHypixelPlayerHistory",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            $ref: "#/components/parameters/player",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Player History.",
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
                    history: {
                      type: "array",
                      example: [
                        {
                          stats: {
                            Bedwars: {
                              practice: {
                                fireballJumping: {
                                  successes: 464,
                                  fails: 420,
                                  SFR: 1.1047619047619048,
                                },
                              },
                            },
                          },
                          timestamp: 1699453062,
                        },
                        {
                          EXP: 46016125,
                          level: 189.3988014553504,
                          karma: 37401363,
                          stats: {
                            Blitz: {
                              coins: 286872,
                            },
                          },
                          timestamp: 1699453185,
                        },
                        {
                          EXP: 46016605,
                          level: 189.39980198009582,
                          karma: 37403863,
                          stats: {
                            Warlords: {
                              coins: 367397,
                            },
                            CvC: {
                              coins: 194880,
                            },
                            Smash: {
                              coins: 135716,
                            },
                          },
                          timestamp: 1699453373,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/election": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Election",
        operationId: "getHypixelSkyblockElection",
        security: [
          {
            "API-Key": [],
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Hypixel Skyblock Election data.",
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
                    currentMayor: {
                      type: "object",
                      properties: {
                        key: {
                          type: "string",
                          example: "MINING",
                        },
                        name: {
                          type: "string",
                          example: "Cole",
                        },
                        perks: {
                          type: "array",
                          uniqueItems: true,
                          items: {
                            type: "object",
                            properties: {
                              name: {
                                type: "string",
                              },
                              description: {
                                type: "string",
                              },
                            },
                          },
                          example: [
                            {
                              name: "Prospection",
                              description: "Mining minions work §a25% §7faster.",
                            },
                            {
                              name: "Mining XP Buff",
                              description: "Get §3+60☯ Mining Wisdom §7on public islands.",
                            },
                            {
                              name: "Mining Fiesta",
                              description: "§7Schedules two Mining Fiesta events during the year!",
                            },
                          ],
                        },
                        votes: {
                          type: "number",
                          example: 555507,
                        },
                      },
                    },
                    nextMayor: {
                      oneOf: [
                        {
                          type: "object",
                          properties: {
                            key: {
                              type: "string",
                              example: "FARMING",
                            },
                            name: {
                              type: "string",
                              example: "Finnegan",
                            },
                            perks: {
                              type: "array",
                              uniqueItems: true,
                              items: {
                                type: "object",
                                properties: {
                                  name: {
                                    type: "string",
                                  },
                                  description: {
                                    type: "string",
                                  },
                                },
                              },
                              example: [
                                {
                                  name: "Farming Simulator",
                                  description: "There is a §a25% §7chance for Mathematical Hoes and the §9Cultivating Enchantment §7to count twice.",
                                },
                                {
                                  name: "GOATed",
                                  description: "§eJacob's Farming Contest §7brackets include §a10% §7more players each.",
                                },
                                {
                                  name: "Pelt-pocalypse",
                                  description: "Obtain §a1.5x §7more §5pelts §7from §aTrevor §7in the §eMushroom Desert§7, hunt a new trapper mob, and purchase items from a new trapper shop.",
                                },
                              ],
                            },
                            votes: {
                              type: "number",
                              example: 339771,
                            },
                          },
                        },
                        {
                          type: "null",
                          description: "Null gets returned if no Election is currently taking place",
                        },
                      ],
                    },
                    currentElection: {
                      oneOf: [
                        {
                          type: "object",
                          properties: {
                            year: {
                              type: "number",
                              example: 314,
                            },
                            candidates: {
                              type: "array",
                              uniqueItems: true,
                              items: {
                                type: "object",
                                properties: {
                                  key: {
                                    type: "string",
                                  },
                                  name: {
                                    type: "string",
                                  },
                                  perks: {
                                    type: "array",
                                    uniqueItems: true,
                                    items: {
                                      type: "object",
                                      properties: {
                                        name: {
                                          type: "string",
                                        },
                                        description: {
                                          type: "string",
                                        },
                                      },
                                    },
                                  },
                                  votes: {
                                    type: "number",
                                  },
                                },
                              },
                              example: [
                                {
                                  key: "FARMING",
                                  name: "Finnegan",
                                  perks: [
                                    {
                                      name: "Farming Simulator",
                                      description: "There is a §a25% §7chance for Mathematical Hoes and the §9Cultivating Enchantment §7to count twice.",
                                    },
                                    {
                                      name: "GOATed",
                                      description: "§eJacob's Farming Contest §7brackets include §a10% §7more players each.",
                                    },
                                    {
                                      name: "Pelt-pocalypse",
                                      description: "Obtain §a1.5x §7more §5pelts §7from §aTrevor §7in the §eMushroom Desert§7, hunt a new trapper mob, and purchase items from a new trapper shop.",
                                    },
                                  ],
                                  votes: 339771,
                                },
                                {
                                  key: "DUNGEONS",
                                  name: "Paul",
                                  perks: [
                                    {
                                      name: "Marauder",
                                      description: "Dungeon reward chests are §e20% §7cheaper.",
                                    },
                                    {
                                      name: "Benediction",
                                      description: "Blessings are §d25% §7stronger.",
                                    },
                                  ],
                                  votes: 80565,
                                },
                                {
                                  key: "EVENTS",
                                  name: "Foxy",
                                  perks: [
                                    {
                                      name: "Benevolence",
                                      description: "Gain §c2.5x §7gifts from the attack event on Jerry's Workshop.",
                                    },
                                    {
                                      name: "Sweet Tooth",
                                      description: "Grants §a+20% §7chance to get Candy from mobs during the §6Spooky Festival§7.",
                                    },
                                    {
                                      name: "Extra Event",
                                      description: "Schedules an extra §bFishing Festival §7event during the year.",
                                    },
                                  ],
                                  votes: 22609,
                                },
                                {
                                  key: "ECONOMIST",
                                  name: "Diaz",
                                  perks: [
                                    {
                                      name: "Barrier Street",
                                      description: "Gain §625% §7more bank interest.",
                                    },
                                    {
                                      name: "Shopping Spree",
                                      description: "Increase daily NPC buy limits by §e10x§7.",
                                    },
                                  ],
                                  votes: 15651,
                                },
                                {
                                  key: "PETS",
                                  name: "Diana",
                                  perks: [
                                    {
                                      name: "Lucky!",
                                      description: "Gain §d+25♣ Pet Luck§7.",
                                    },
                                  ],
                                  votes: 13745,
                                },
                              ],
                            },
                          },
                        },
                        {
                          type: "null",
                          description: "Null gets returned if no Election is currently taking place",
                        },
                      ],
                    },
                    lastElection: {
                      type: "object",
                      properties: {
                        year: {
                          type: "number",
                          example: 313,
                        },
                        candidates: {
                          type: "array",
                          uniqueItems: true,
                          items: {
                            type: "object",
                            properties: {
                              key: {
                                type: "string",
                              },
                              name: {
                                type: "string",
                              },
                              perks: {
                                type: "array",
                                uniqueItems: true,
                                items: {
                                  type: "object",
                                  properties: {
                                    name: {
                                      type: "string",
                                    },
                                    description: {
                                      type: "string",
                                    },
                                  },
                                },
                              },
                              votes: {
                                type: "number",
                              },
                            },
                          },
                          example: [
                            {
                              key: "MINING",
                              name: "Cole",
                              perks: [
                                {
                                  name: "Prospection",
                                  description: "Mining minions work §a25% §7faster.",
                                },
                                {
                                  name: "Mining XP Buff",
                                  description: "Get §3+60☯ Mining Wisdom §7on public islands.",
                                },
                                {
                                  name: "Mining Fiesta",
                                  description: "§7Schedules two Mining Fiesta events during the year!",
                                },
                              ],
                              votes: 555507,
                            },
                            {
                              key: "FISHING",
                              name: "Marina",
                              perks: [
                                {
                                  name: "Fishing XP Buff",
                                  description: "Gain §3+50☯ Fishing Wisdom §7on public islands.",
                                },
                                {
                                  name: "Luck of the Sea 2.0",
                                  description: "Gain §315α Sea Creature Chance§7.",
                                },
                                {
                                  name: "Fishing Festival",
                                  description: "Start a special fishing event the first §b3 §7days of each month!",
                                },
                              ],
                              votes: 165602,
                            },
                            {
                              key: "DUNGEONS",
                              name: "Paul",
                              perks: [
                                {
                                  name: "Marauder",
                                  description: "Dungeon reward chests are §e20% §7cheaper.",
                                },
                                {
                                  name: "Benediction",
                                  description: "Blessings are §d25% §7stronger.",
                                },
                              ],
                              votes: 100401,
                            },
                            {
                              key: "SLAYER",
                              name: "Aatrox",
                              perks: [
                                {
                                  name: "Slayer XP Buff",
                                  description: "Earn §d25% §7more Slayer XP.",
                                },
                              ],
                              votes: 34919,
                            },
                            {
                              key: "EVENTS",
                              name: "Foxy",
                              perks: [
                                {
                                  name: "Benevolence",
                                  description: "Gain §c2.5x §7gifts from the attack event on Jerry's Workshop.",
                                },
                                {
                                  name: "Extra Event",
                                  description: "Schedules an extra §6Spooky Festival §7event during the year.",
                                },
                              ],
                              votes: 6273,
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/election/history": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Election History",
        operationId: "getHypixelSkyblockElectionHistory",
        security: [
          {
            "API-Key": [],
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Hypixel Skyblock Election History.",
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
                    history: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          year: {
                            type: "number",
                          },
                          candidates: {
                            type: "array",
                            uniqueItems: true,
                            items: {
                              type: "object",
                              properties: {
                                key: {
                                  type: "string",
                                },
                                name: {
                                  type: "string",
                                },
                                perks: {
                                  type: "array",
                                  uniqueItems: true,
                                  items: {
                                    type: "object",
                                    properties: {
                                      name: {
                                        type: "string",
                                      },
                                      description: {
                                        type: "string",
                                      },
                                    },
                                  },
                                },
                                votes: {
                                  type: "number",
                                },
                              },
                            },
                          },
                          timestamp: {
                            type: "number",
                          },
                        },
                      },
                      example: [
                        {
                          year: 311,
                          candidates: [
                            {
                              key: "SLAYER",
                              name: "Aatrox",
                              perks: [
                                {
                                  name: "SLASHED Pricing",
                                  description: "Starting slayer quests is §ehalf price§7.",
                                },
                                {
                                  name: "Slayer XP Buff",
                                  description: "Earn §d25% §7more Slayer XP.",
                                },
                              ],
                              votes: 617402,
                            },
                            {
                              key: "FARMING",
                              name: "Finnegan",
                              perks: [
                                {
                                  name: "Farming Simulator",
                                  description: "There is a §a25% §7chance for Mathematical Hoes and the §9Cultivating Enchantment §7to count twice.",
                                },
                                {
                                  name: "GOATed",
                                  description: "§eJacob's Farming Contest §7brackets include §a10% §7more players each.",
                                },
                                {
                                  name: "Pelt-pocalypse",
                                  description: "Obtain §a1.5x §7more §5pelts §7from §aTrevor §7in the §eMushroom Desert§7, hunt a new trapper mob, and purchase items from a new trapper shop.",
                                },
                              ],
                              votes: 127341,
                            },
                            {
                              key: "FISHING",
                              name: "Marina",
                              perks: [
                                {
                                  name: "Fishing XP Buff",
                                  description: "Gain §3+50☯ Fishing Wisdom §7on public islands.",
                                },
                                {
                                  name: "Fishing Festival",
                                  description: "Start a special fishing event the first §b3 §7days of each month!",
                                },
                              ],
                              votes: 93922,
                            },
                            {
                              key: "DUNGEONS",
                              name: "Paul",
                              perks: [
                                {
                                  name: "Marauder",
                                  description: "Dungeon reward chests are §e20% §7cheaper.",
                                },
                              ],
                              votes: 33858,
                            },
                            {
                              key: "EVENTS",
                              name: "Foxy",
                              perks: [
                                {
                                  name: "Extra Event",
                                  description: "Schedules an extra §6Mining Fiesta §7event during the year.",
                                },
                              ],
                              votes: 15098,
                            },
                          ],
                          timestamp: 1699282805,
                        },
                        {
                          year: 312,
                          candidates: [
                            {
                              key: "SHADY",
                              name: "Scorpius",
                              perks: [
                                {
                                  name: "Bribe",
                                  description: "If Scorpius wins and you voted for him, Mayor Scorpius will offer you coins as a token of gratitude.",
                                },
                                {
                                  name: "Darker Auctions",
                                  description: "Scorpius will intrude in Dark Auctions, increasing the amount of rounds to 7 and offering special items.",
                                },
                              ],
                              votes: 1149243,
                            },
                            {
                              key: "MINING",
                              name: "Cole",
                              perks: [
                                {
                                  name: "Prospection",
                                  description: "Mining minions work §a25% §7faster.",
                                },
                                {
                                  name: "Mining Fiesta",
                                  description: "§7Schedules two Mining Fiesta events during the year!",
                                },
                              ],
                              votes: 9327,
                            },
                            {
                              key: "FARMING",
                              name: "Finnegan",
                              perks: [
                                {
                                  name: "Farming Simulator",
                                  description: "There is a §a25% §7chance for Mathematical Hoes and the §9Cultivating Enchantment §7to count twice.",
                                },
                                {
                                  name: "GOATed",
                                  description: "§eJacob's Farming Contest §7brackets include §a10% §7more players each.",
                                },
                                {
                                  name: "Pelt-pocalypse",
                                  description: "Obtain §a1.5x §7more §5pelts §7from §aTrevor §7in the §eMushroom Desert§7, hunt a new trapper mob, and purchase items from a new trapper shop.",
                                },
                              ],
                              votes: 8621,
                            },
                            {
                              key: "PETS",
                              name: "Diana",
                              perks: [
                                {
                                  name: "Lucky!",
                                  description: "Gain §d+25♣ Pet Luck§7.",
                                },
                              ],
                              votes: 2695,
                            },
                            {
                              key: "ECONOMIST",
                              name: "Diaz",
                              perks: [
                                {
                                  name: "Barrier Street",
                                  description: "Gain §625% §7more bank interest.",
                                },
                                {
                                  name: "Shopping Spree",
                                  description: "Increase daily NPC buy limits by §e10x§7.",
                                },
                              ],
                              votes: 2041,
                            },
                          ],
                          timestamp: 1699704005,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/items": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Items",
        operationId: "getHypixelSkyblockItems",
        security: [
          {
            "API-Key": [],
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Hypixel Skyblock Items.",
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
                    items: {
                      type: "object",
                      properties: {
                        RECOMBOBULATOR_3000: {
                          type: "object",
                          properties: {
                            material: {
                              type: "string",
                              example: "SKULL_ITEM",
                            },
                            durability: {
                              type: "number",
                              example: 3,
                            },
                            name: {
                              type: "string",
                              example: "Recombobulator 3000",
                            },
                            tier: {
                              type: "string",
                              enum: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "DIVINE", "SPECIAL", "VERY_SPECIAL"],
                              example: "LEGENDARY",
                            },
                            dungeon_item: {
                              type: "boolean",
                              example: true,
                            },
                            museum: {
                              type: "boolean",
                              example: true,
                            },
                            texture: {
                              type: "string",
                              description: "Shortened Link to the Item's texture only containing the Skin's SHA-256 Hash: eg. http://textures.minecraft.net/texture/{HASH}",
                              example: "57ccd36dc8f72adcb1f8c8e61ee82cd96ead140cf2a16a1366be9b5a8e3cc3fc",
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
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },

          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/items/{ID}": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Item",
        operationId: "getHypixelSkyblockItem",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "ID",
            in: "path",
            schema: {
              type: "string",
              description: "Hypixel Skyblock Item ID",
              example: "RECOMBOBULATOR_3000",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Hypixel Skyblock Item.",
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
                    item: {
                      type: "object",
                      properties: {
                        material: {
                          type: "string",
                          example: "SKULL_ITEM",
                        },
                        durability: {
                          type: "number",
                          example: 3,
                        },
                        name: {
                          type: "string",
                          example: "Recombobulator 3000",
                        },
                        tier: {
                          type: "string",
                          enum: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "DIVINE", "SPECIAL", "VERY_SPECIAL"],
                          example: "LEGENDARY",
                        },
                        dungeon_item: {
                          type: "boolean",
                          example: true,
                        },
                        museum: {
                          type: "boolean",
                          example: true,
                        },
                        texture: {
                          type: "string",
                          description: "Shortened Link to the Item's texture only containing the Skin's SHA-256 Hash: eg. http://textures.minecraft.net/texture/{HASH}",
                          example: "57ccd36dc8f72adcb1f8c8e61ee82cd96ead140cf2a16a1366be9b5a8e3cc3fc",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/auctionhouse/query": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Query Auctions",
        operationId: "queryHypixelSkyblockAuctions",
        security: [
          {
            "API-Key": ["hypixel:querySkyblockAuctions"],
          },
        ],
        parameters: [
          {
            name: "seller",
            in: "query",
            schema: {
              type: "UUID",
            },
          },
          {
            name: "sellerProfile",
            in: "query",
            schema: {
              type: "UUID",
            },
          },
          {
            name: "coop",
            in: "query",
            schema: {
              type: "boolean",
            },
          },
          {
            name: "category",
            in: "query",
            schema: {
              type: "string",
              enum: ["WEAPON", "ARMOR", "ACCESSORIES", "CONSUMABLES", "BLOCKS", "MISC"],
            },
          },
          {
            name: "bin",
            in: "query",
            schema: {
              type: "boolean",
            },
          },
          {
            name: "price",
            in: "query",
            schema: {
              type: "number",
            },
          },
          {
            name: "priceRange",
            description: "Example: `[0,10000]` or `[100000,inf]`",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "name",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "lore",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "tier",
            in: "query",
            schema: {
              type: "string",
              enum: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "DIVINE", "SPECIAL", "VERY_SPECIAL"],
            },
          },
          {
            name: "itemID",
            in: "query",
            schema: {
              type: "UUID",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully queried Hypixel Skyblock Auctions.",
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
                    filter: {
                      type: "object",
                      properties: {
                        seller: {
                          type: "string",
                        },
                        sellerProfile: {
                          type: "string",
                        },
                        coop: {
                          type: "boolean",
                        },
                        category: {
                          type: "string",
                        },
                        bin: {
                          type: "boolean",
                        },
                        price: {
                          type: "number",
                        },
                        priceRange: {
                          type: "string",
                        },
                        name: {
                          type: "string",
                        },
                        lore: {
                          type: "string",
                        },
                        tier: {
                          type: "string",
                        },
                        itemID: {
                          type: "string",
                        },
                      },
                      example: {
                        bin: false,
                        name: "Hyperion",
                      },
                    },
                    count: {
                      type: "number",
                      example: 20000,
                    },
                    matches: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                      },
                      example: [
                        {
                          UUID: "513df784b66c47feb04af9105dee959b",
                          seller: "694d38d2276a495981e866ed2dbf99a3",
                          sellerProfile: "e7403764fcac4a2785128be99cc3ad8a",
                          coop: false,
                          started: 1699371275,
                          ending: 1699392875,
                          category: "BLOCKS",
                          bin: true,
                          startingBid: 500000,
                          highestBid: 500000,
                          bids: [],
                          item: {
                            count: 1,
                            name: "§cKat Flower",
                            lore: ["§7Give this to §bKat §7the §aPet", "§aSitter §7in order to skip §91", "§9day §7of wait time while", "§7upgrading your pet!", "§7", "§7§eRight-click on Kat to use", "", "§c§lSPECIAL"],
                            tier: "SPECIAL",
                            timestamp: 1699349580,
                            ID: "KAT_FLOWER",
                            UUID: "992e352e898d4d05b2ac1516fad5832a",
                          },
                        },
                        {
                          UUID: "8707d3b5dadc46ee8668ad513231984b",
                          seller: "ace9d421b08847b2a156c280e9b44845",
                          sellerProfile: "49c592d792e347709760c0a74023c051",
                          coop: false,
                          started: 1699371275,
                          ending: 1699392875,
                          category: "MISC",
                          bin: true,
                          startingBid: 957000,
                          highestBid: 957000,
                          bids: [],
                          item: {
                            count: 1,
                            name: "§5Greater Backpack",
                            lore: ["§7A bag with §a36§7 slots which", "§7can be placed in your Storage", "§7Menu to store additional items.", "", "§5§lEPIC"],
                            tier: "EPIC",
                            timestamp: 1699349640,
                            ID: "GREATER_BACKPACK",
                            UUID: "f29c94df5a9940449092f67b6fcf43a8",
                            attributes: {
                              backpack_color: "DEFAULT",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/auctionhouse/player/{player}/recent": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Recent Player Auctions",
        description: "Returns the most recent (up to 100) Auctions of a Player.",
        operationId: "getHypixelSkyblockRecentPlayerAuctions",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            $ref: "#/components/parameters/player",
          },
          {
            name: "data",
            in: "query",
            schema: {
              type: "string",
              enum: ["buy", "sell"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Player's recent Auctions",
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
                    auctions: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                      },
                      example: [
                        {
                          timestamp: 1699535646,
                          UUID: "6d21fb58c3f74c42a1d9a58ebb7568dc",
                          sellerProfile: "608f4d91a6e445f397031f5b11d1e651",
                          buyer: "3e283f0e68f9413dbd91576c5c29ca0c",
                          price: 59000000,
                          bin: true,
                          item: {
                            count: 1,
                            name: "§dAncient Maxor's Boots §6✪§6✪§6✪§6✪§6✪",
                            tier: "MYTHIC",
                            ID: "SPEED_WITHER_BOOTS",
                            UUID: "e813edbeb3be4946936a402899d5e818",
                            timestamp: 1611916680,
                            attributes: {
                              modifier: "Ancient",
                              rarity_upgrades: 1,
                              hot_potato_count: 15,
                              gems: {
                                COMBAT_0: "FINE",
                                COMBAT_1_gem: "JASPER",
                                COMBAT_1: "FINE",
                                COMBAT_0_gem: "JASPER",
                                UNIVERSAL_0: "FLAWLESS",
                                UNIVERSAL_0_gem: "TOPAZ",
                              },
                              runes: {
                                RAINBOW: 3,
                              },
                              dungeon_item_level: 5,
                              enchantments: {
                                depth_strider: 3,
                                strong_mana: 3,
                                thorns: 3,
                                sugar_rush: 3,
                                ultimate_legion: 5,
                                feather_falling: 10,
                                rejuvenate: 5,
                                growth: 6,
                                protection: 6,
                              },
                            },
                          },
                        },
                        {
                          timestamp: 1699535586,
                          UUID: "58408965845b479e9743b41b70294b4e",
                          sellerProfile: "27c9514cf3bd4f69b0ac653a90fb4cd6",
                          buyer: "3e283f0e68f9413dbd91576c5c29ca0c",
                          price: 68000000,
                          bin: true,
                          item: {
                            count: 1,
                            name: "§dAncient Necron's Leggings §6✪§6✪§6✪§6✪§6✪§c➊",
                            tier: "MYTHIC",
                            ID: "POWER_WITHER_LEGGINGS",
                            UUID: "8b9a99cb858c4644b1cb3666c1fe5fe2",
                            timestamp: 1633113060,
                            attributes: {
                              modifier: "Ancient",
                              rarity_upgrades: 1,
                              hot_potato_count: 15,
                              gems: {
                                JASPER_0: "FINE",
                                COMBAT_0: "FINE",
                                unlocked_slots: ["JASPER_0", "COMBAT_0"],
                                COMBAT_0_gem: "JASPER",
                              },
                              dungeon_item_level: 5,
                              upgrade_level: 6,
                              enchantments: {
                                ultimate_wisdom: 5,
                                smarty_pants: 5,
                                ferocious_mana: 4,
                                rejuvenate: 5,
                                growth: 6,
                                protection: 6,
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/auctionhouse/player/{player}": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "All Player Auctions",
        description: 'Returns "all" the Auctions from a Player with pagination. One page contains up to 100 Auctions.',
        operationId: "getHypixelSkylbockPlayerAuctions",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            $ref: "#/components/parameters/player",
          },
          {
            name: "data",
            in: "query",
            schema: {
              type: "string",
              enum: ["buy", "sell"],
            },
          },
          {
            name: "page",
            in: "query",
            schema: {
              type: "number",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Player's recent Auctions.",
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
                    auctions: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                      },
                      example: [
                        {
                          timestamp: 1699535646,
                          UUID: "6d21fb58c3f74c42a1d9a58ebb7568dc",
                          sellerProfile: "608f4d91a6e445f397031f5b11d1e651",
                          buyer: "3e283f0e68f9413dbd91576c5c29ca0c",
                          price: 59000000,
                          bin: true,
                          item: {
                            count: 1,
                            name: "§dAncient Maxor's Boots §6✪§6✪§6✪§6✪§6✪",
                            tier: "MYTHIC",
                            ID: "SPEED_WITHER_BOOTS",
                            UUID: "e813edbeb3be4946936a402899d5e818",
                            timestamp: 1611916680,
                            attributes: {
                              modifier: "Ancient",
                              rarity_upgrades: 1,
                              hot_potato_count: 15,
                              gems: {
                                COMBAT_0: "FINE",
                                COMBAT_1_gem: "JASPER",
                                COMBAT_1: "FINE",
                                COMBAT_0_gem: "JASPER",
                                UNIVERSAL_0: "FLAWLESS",
                                UNIVERSAL_0_gem: "TOPAZ",
                              },
                              runes: {
                                RAINBOW: 3,
                              },
                              dungeon_item_level: 5,
                              enchantments: {
                                depth_strider: 3,
                                strong_mana: 3,
                                thorns: 3,
                                sugar_rush: 3,
                                ultimate_legion: 5,
                                feather_falling: 10,
                                rejuvenate: 5,
                                growth: 6,
                                protection: 6,
                              },
                            },
                          },
                        },
                        {
                          timestamp: 1699535586,
                          UUID: "58408965845b479e9743b41b70294b4e",
                          sellerProfile: "27c9514cf3bd4f69b0ac653a90fb4cd6",
                          buyer: "3e283f0e68f9413dbd91576c5c29ca0c",
                          price: 68000000,
                          bin: true,
                          item: {
                            count: 1,
                            name: "§dAncient Necron's Leggings §6✪§6✪§6✪§6✪§6✪§c➊",
                            tier: "MYTHIC",
                            ID: "POWER_WITHER_LEGGINGS",
                            UUID: "8b9a99cb858c4644b1cb3666c1fe5fe2",
                            timestamp: 1633113060,
                            attributes: {
                              modifier: "Ancient",
                              rarity_upgrades: 1,
                              hot_potato_count: 15,
                              gems: {
                                JASPER_0: "FINE",
                                COMBAT_0: "FINE",
                                unlocked_slots: ["JASPER_0", "COMBAT_0"],
                                COMBAT_0_gem: "JASPER",
                              },
                              dungeon_item_level: 5,
                              upgrade_level: 6,
                              enchantments: {
                                ultimate_wisdom: 5,
                                smarty_pants: 5,
                                ferocious_mana: 4,
                                rejuvenate: 5,
                                growth: 6,
                                protection: 6,
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/auctionhouse/item/{UUID}": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Auction Item History",
        description: "Returns all past Auctions about the same exact unique Skyblock Item.",
        operationId: "getHypixelSkyblockItemHistory",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "UUID",
            in: "path",
            schema: {
              type: "string",
              description: "Hypixel Skyblock Item UUID",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Item History.",
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
                    auctions: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                      },
                      example: [
                        {
                          UUID: "3543eb119e8345bab83f0e2d19ba48c6",
                          bin: true,
                          buyer: "c0f55348fa6943a7aebb429bdfc0d572",
                          item: {
                            count: 1,
                            name: "§6Wise Sorrow Helmet",
                            tier: "LEGENDARY",
                            timestamp: 1657288620,
                            ID: "SORROW_HELMET",
                            UUID: "12b48efea327492a9d1e56dd15c74573",
                            attributes: {
                              modifier: "Wise",
                              hot_potato_count: 10,
                              gems: {
                                JADE_0: "FINE",
                                unlocked_slots: ["JADE_0", "UNIVERSAL_0"],
                                AMBER_0: "FINE",
                                UNIVERSAL_0: "FINE",
                                UNIVERSAL_0_gem: "TOPAZ",
                              },
                              enchantments: {
                                ultimate_wisdom: 3,
                                thorns: 3,
                                rejuvenate: 3,
                                growth: 5,
                                protection: 5,
                                respiration: 3,
                                aqua_affinity: 1,
                              },
                            },
                          },
                          price: 12400000,
                          seller: "307a8f0021d14443983a5612c84aa3b4",
                          sellerProfile: "03046deadf064837ab8c7004b5eb697e",
                          timestamp: 1685058600,
                        },
                        {
                          UUID: "2f7a9813aabd41df9c30c31d41f011c3",
                          bin: true,
                          buyer: "307a8f0021d14443983a5612c84aa3b4",
                          item: {
                            count: 1,
                            name: "§6Wise Sorrow Helmet",
                            tier: "LEGENDARY",
                            timestamp: 1657288620,
                            ID: "SORROW_HELMET",
                            UUID: "12b48efea327492a9d1e56dd15c74573",
                            attributes: {
                              modifier: "Wise",
                              hot_potato_count: 10,
                              gems: {
                                JADE_0: "FINE",
                                unlocked_slots: ["JADE_0", "UNIVERSAL_0"],
                                AMBER_0: "FINE",
                                UNIVERSAL_0: "FINE",
                                UNIVERSAL_0_gem: "TOPAZ",
                              },
                              enchantments: {
                                ultimate_wisdom: 3,
                                thorns: 3,
                                rejuvenate: 3,
                                growth: 5,
                                protection: 5,
                                respiration: 3,
                                aqua_affinity: 1,
                              },
                            },
                          },
                          price: 12599000,
                          seller: "0c508a91b27748509d1341f18ec342c6",
                          sellerProfile: "b53fa4b503a54da284b2ffb8d93c5235",
                          timestamp: 1683688562,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/auctionhouse/price/{ID}": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Auction Item Price",
        description: "Returns the current price of the specified Skyblock Item.",
        operationId: "getCurrentHypixelSkyblockAuctionhouseItemPrice",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "ID",
            in: "path",
            schema: {
              type: "string",
              description: "Hypixel Skyblock Item ID",
              example: "HYPERION",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Item Price.",
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
                    item: {
                      type: "object",
                      properties: {
                        minPrice: {
                          type: "number",
                          example: 1690000000,
                        },
                        maxPrice: {
                          type: "number",
                          example: 1718999999,
                        },
                        averagePrice: {
                          type: "number",
                          example: 1704499999,
                        },
                        medianPrice: {
                          type: "number",
                          example: 1704499999,
                        },
                        timestamp: {
                          type: "number",
                          example: 1699645625,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/auctionhouse/price/{ID}/history": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Auction Item Alltime Price History",
        description: "Returns alltime price history of the specified Skyblock Item.",
        operationId: "getHypixelSkyblockItemPriceHistory",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "ID",
            in: "path",
            schema: {
              type: "string",
              description: "Hypixel Skyblock Item ID",
              example: "HYPERION",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Item Price History.",
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
                    history: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          minPrice: {
                            type: "number",
                            example: 1690000000,
                          },
                          maxPrice: {
                            type: "number",
                            example: 1718999999,
                          },
                          averagePrice: {
                            type: "number",
                            example: 1704499999,
                          },
                          medianPrice: {
                            type: "number",
                            example: 1704499999,
                          },
                          timestamp: {
                            type: "number",
                            example: 1699645625,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/auctionhouse/price/{ID}/history/{TIMEFRAME}": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Item Auction Price History",
        description: "Returns price history for the specified timeframe of the specified Skyblock Item.",
        operationId: "getHypixelSkyblockItemAuctionhousePriceHistoryByTimeframe",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "ID",
            in: "path",
            schema: {
              type: "string",
              description: "Hypixel Skyblock Item ID",
              example: "HYPERION",
            },
          },
          {
            name: "timeframe",
            in: "path",
            schema: {
              type: "string",
              enum: ["hour", "day", "week", "month", "year"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Item Price History.",
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
                    history: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          minPrice: {
                            type: "number",
                            example: 1690000000,
                          },
                          maxPrice: {
                            type: "number",
                            example: 1718999999,
                          },
                          averagePrice: {
                            type: "number",
                            example: 1704499999,
                          },
                          medianPrice: {
                            type: "number",
                            example: 1704499999,
                          },
                          timestamp: {
                            type: "number",
                            example: 1699645625,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/bazaar": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Bazaar",
        description: "Returns the full current Bazaar data plus additional info about the Products/Items.",
        operationId: "getHypixelSkyblockBazaar",
        security: [
          {
            "API-Key": [],
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Bazaar.",
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
                    products: {
                      type: "object",
                      properties: {
                        PRODUCT: {
                          type: "object",
                          properties: {
                            sellSummary: {
                              uniqueItems: true,
                              items: {
                                type: "object",
                                properties: {
                                  amount: {
                                    type: "number",
                                  },
                                  pricePerUnit: {
                                    type: "number",
                                  },
                                  orders: {
                                    type: "number",
                                  },
                                },
                              },
                            },
                            buySummary: {
                              uniqueItems: true,
                              items: {
                                type: "object",
                                properties: {
                                  amount: {
                                    type: "number",
                                  },
                                  pricePerUnit: {
                                    type: "number",
                                  },
                                  orders: {
                                    type: "number",
                                  },
                                },
                              },
                            },
                            quickStatus: {
                              type: "object",
                              properties: {
                                sellPrice: {
                                  type: "number",
                                },
                                sellVolume: {
                                  type: "number",
                                },
                                sellMovingWeek: {
                                  type: "number",
                                },
                                sellOrders: {
                                  type: "number",
                                },
                                buyPrice: {
                                  type: "number",
                                },
                                buyVolume: {
                                  type: "number",
                                },
                                buyMovingWeek: {
                                  type: "number",
                                },
                                buyOrders: {
                                  type: "number",
                                },
                              },
                            },
                            item: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                },
                                material: {
                                  type: "string",
                                },
                              },
                            },
                          },
                        },
                      },
                      example: {
                        RECOMBOBULATOR_3000: {
                          sellSummary: [
                            {
                              amount: 1,
                              pricePerUnit: 7257325.4,
                              orders: 1,
                            },
                            {
                              amount: 11,
                              pricePerUnit: 7257325.1,
                              orders: 3,
                            },
                            {
                              amount: 3,
                              pricePerUnit: 7257324.6,
                              orders: 1,
                            },
                            {
                              amount: 12,
                              pricePerUnit: 7200000.5,
                              orders: 1,
                            },
                            {
                              amount: 2,
                              pricePerUnit: 7120804.2,
                              orders: 1,
                            },
                          ],
                          buySummary: [
                            {
                              amount: 1,
                              pricePerUnit: 7346754.2,
                              orders: 1,
                            },
                            {
                              amount: 1,
                              pricePerUnit: 7346754.3,
                              orders: 1,
                            },
                            {
                              amount: 4,
                              pricePerUnit: 7356690.9,
                              orders: 2,
                            },
                            {
                              amount: 6,
                              pricePerUnit: 7356691,
                              orders: 1,
                            },
                            {
                              amount: 1,
                              pricePerUnit: 7356691.1,
                              orders: 1,
                            },
                          ],
                          quickStatus: {
                            sellPrice: 6080239,
                            sellVolume: 59918,
                            sellMovingWeek: 39927,
                            sellOrders: 2828,
                            buyPrice: 7374871.3,
                            buyVolume: 3539,
                            buyMovingWeek: 55590,
                            buyOrders: 417,
                          },
                          item: {
                            material: "SKULL_ITEM",
                            durability: 3,
                            name: "Recombobulator 3000",
                            tier: "LEGENDARY",
                            dungeon_item: true,
                            museum: true,
                            texture: "57ccd36dc8f72adcb1f8c8e61ee82cd96ead140cf2a16a1366be9b5a8e3cc3fc",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },

          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/bazaar/{ID}": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Bazaar Product",
        description: "Returns current Bazaar data for the specified Item plus additional info about the Item.",
        operationId: "getHypixelSkyblockBazaarProduct",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "ID",
            in: "path",
            schema: {
              type: "string",
              description: "Hypixel Skyblock Item ID",
              example: "RECOMBOBULATOR_3000",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Bazaar Product.",
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
            parameters: [
              {
                name: "ID",
                in: "path",
                schema: {
                  type: "string",
                  description: "Hypixel Skyblock Item ID",
                  example: "HYPERION",
                },
              },
            ],
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    product: {
                      type: "object",
                      properties: {
                        sellSummary: {
                          uniqueItems: true,
                          items: {
                            type: "object",
                            properties: {
                              amount: {
                                type: "number",
                              },
                              pricePerUnit: {
                                type: "number",
                              },
                              orders: {
                                type: "number",
                              },
                            },
                          },
                          example: [
                            {
                              amount: 1,
                              pricePerUnit: 7257325.4,
                              orders: 1,
                            },
                            {
                              amount: 11,
                              pricePerUnit: 7257325.1,
                              orders: 3,
                            },
                            {
                              amount: 3,
                              pricePerUnit: 7257324.6,
                              orders: 1,
                            },
                            {
                              amount: 12,
                              pricePerUnit: 7200000.5,
                              orders: 1,
                            },
                            {
                              amount: 2,
                              pricePerUnit: 7120804.2,
                              orders: 1,
                            },
                          ],
                        },
                        buySummary: {
                          type: "array",
                          uniqueItems: true,
                          items: {
                            properties: {
                              amount: {
                                type: "number",
                              },
                              pricePerUnit: {
                                type: "number",
                              },
                              orders: {
                                type: "number",
                              },
                            },
                          },
                          example: [
                            {
                              amount: 1,
                              pricePerUnit: 7346754.2,
                              orders: 1,
                            },
                            {
                              amount: 1,
                              pricePerUnit: 7346754.3,
                              orders: 1,
                            },
                            {
                              amount: 4,
                              pricePerUnit: 7356690.9,
                              orders: 2,
                            },
                            {
                              amount: 6,
                              pricePerUnit: 7356691,
                              orders: 1,
                            },
                            {
                              amount: 1,
                              pricePerUnit: 7356691.1,
                              orders: 1,
                            },
                          ],
                        },
                        quickStatus: {
                          type: "object",
                          properties: {
                            sellPrice: {
                              type: "number",
                            },
                            sellVolume: {
                              type: "number",
                            },
                            sellMovingWeek: {
                              type: "number",
                            },
                            sellOrders: {
                              type: "number",
                            },
                            buyPrice: {
                              type: "number",
                            },
                            buyVolume: {
                              type: "number",
                            },
                            buyMovingWeek: {
                              type: "number",
                            },
                            buyOrders: {
                              type: "number",
                            },
                          },
                          example: {
                            sellPrice: 6080239,
                            sellVolume: 59918,
                            sellMovingWeek: 39927,
                            sellOrders: 2828,
                            buyPrice: 7374871.3,
                            buyVolume: 3539,
                            buyMovingWeek: 55590,
                            buyOrders: 417,
                          },
                        },
                        item: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                            },
                            material: {
                              type: "string",
                            },
                          },
                          example: {
                            material: "SKULL_ITEM",
                            durability: 3,
                            name: "Recombobulator 3000",
                            tier: "LEGENDARY",
                            dungeon_item: true,
                            museum: true,
                            texture: "57ccd36dc8f72adcb1f8c8e61ee82cd96ead140cf2a16a1366be9b5a8e3cc3fc",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/bazaar/{ID}/history": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Bazaar Product Alltime Price History",
        description: "Returns alltime price history of the specified Product.",
        operationId: "getHypixelSkyblockBazaarItemPriceHistory",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "ID",
            in: "path",
            schema: {
              type: "string",
              description: "Hypixel Skyblock Item ID",
              example: "RECOMBOBULATOR_3000",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Item Price History.",
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
                    history: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          minPrice: {
                            type: "number",
                            example: 1690000000,
                          },
                          maxPrice: {
                            type: "number",
                            example: 1718999999,
                          },
                          averagePrice: {
                            type: "number",
                            example: 1704499999,
                          },
                          medianPrice: {
                            type: "number",
                            example: 1704499999,
                          },
                          timestamp: {
                            type: "number",
                            example: 1699645625,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/hypixel/skyblock/bazaar/{ID}/history/{TIMEFRAME}": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Bazaar Product Price History",
        description: "Returns price history for the specified timeframe of the specified product.",
        operationId: "getHypixelSkyblockBazaarItemPriceHistoryByTimeframe",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "ID",
            in: "path",
            schema: {
              type: "string",
              description: "Hypixel Skyblock Item ID",
              example: "RECOMBOBULATOR_3000",
            },
          },
          {
            name: "timeframe",
            in: "path",
            schema: {
              type: "string",
              enum: ["hour", "day", "week", "month", "year"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Item Price History.",
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
                    history: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          minPrice: {
                            type: "number",
                            example: 1690000000,
                          },
                          maxPrice: {
                            type: "number",
                            example: 1718999999,
                          },
                          averagePrice: {
                            type: "number",
                            example: 1704499999,
                          },
                          medianPrice: {
                            type: "number",
                            example: 1704499999,
                          },
                          timestamp: {
                            type: "number",
                            example: 1699645625,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/wynncraft/player/{PLAYER}": {
      get: {
        tags: ["Wynncraft"],
        summary: "Player",
        description: "Returns the latest player data.\n\n**MAY NOT BE UP TO DATE**",
        operationId: "getWynncraftPlayer",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            $ref: "#/components/parameters/player",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Player.",
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
                    player: {
                      type: "object",
                      properties: {
                        UUID: {
                          type: "UUID",
                          example: "14727faefbdc4aff848cd2713eb9939e",
                        },
                        username: {
                          type: "string",
                          example: "Pixelic",
                        },
                        characters: {
                          type: "object",
                          properties: {
                            CHARACTER: {
                              type: "object",
                              properties: {
                                class: {
                                  type: "string",
                                  enum: ["ARCHER", "WARRIOR", "MAGE", "ASSASSIN", "SHAMAN"],
                                },
                                nick: {
                                  oneOf: [
                                    {
                                      type: "string",
                                    },
                                    {
                                      type: "null",
                                    },
                                  ],
                                },
                                level: {
                                  type: "number",
                                },
                                totalLevels: {
                                  type: "number",
                                },
                                EXP: {
                                  type: "number",
                                },
                                levelPercent: {
                                  type: "number",
                                },
                                wars: {
                                  type: "number",
                                },
                                mobsKilled: {
                                  type: "number",
                                },
                                chestsFound: {
                                  type: "number",
                                },
                                blocksWalked: {
                                  type: "number",
                                },
                                playtime: {
                                  type: "number",
                                },
                                logins: {
                                  type: "number",
                                },
                                deaths: {
                                  type: "number",
                                },
                                discoveries: {
                                  type: "number",
                                },
                                pvp: {
                                  type: "object",
                                  properties: {
                                    kills: {
                                      type: "number",
                                    },
                                    deaths: {
                                      type: "number",
                                    },
                                  },
                                },
                                gamemodes: {
                                  type: "array",
                                  uniqueItems: true,
                                  items: {
                                    type: "string",
                                    enum: ["IRONMAN", "ULTIMATE_IRONMAN", "CRAFTSMAN", "HUNTED", "HARDCORE"],
                                  },
                                },
                                skillPoints: {
                                  type: "object",
                                  properties: {
                                    strength: {
                                      type: "number",
                                    },
                                    intelligence: {
                                      type: "number",
                                    },
                                  },
                                },
                                professions: {
                                  type: "object",
                                  properties: {
                                    fishing: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    woodcutting: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    mining: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    farming: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    scribing: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    jeweling: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    alchemism: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    cooking: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    weaponsmithing: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    tailoring: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    woodworking: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                    armouring: {
                                      type: "object",
                                      properties: {
                                        level: {
                                          type: "number",
                                        },
                                        levelPercent: {
                                          type: "number",
                                        },
                                      },
                                    },
                                  },
                                },
                                dungeons: {
                                  type: "object",
                                  properties: {
                                    total: {
                                      type: "number",
                                    },
                                    list: {
                                      type: "object",
                                      properties: {
                                        DUNGEON: {
                                          type: "number",
                                        },
                                      },
                                    },
                                  },
                                },
                                raids: {
                                  type: "object",
                                  properties: {
                                    total: {
                                      type: "number",
                                    },
                                    list: {
                                      type: "object",
                                      properties: {
                                        DUNGEON: {
                                          type: "number",
                                        },
                                      },
                                    },
                                  },
                                },
                                questsCompleted: {
                                  type: "number",
                                },
                                quests: {
                                  type: "array",
                                  uniqueItems: true,
                                  items: {
                                    type: "string",
                                  },
                                },
                              },
                            },
                          },
                          example: {
                            class: "MAGE",
                            nick: null,
                            level: 7,
                            totalLevels: 0,
                            EXP: 311,
                            levelPercent: 29,
                            wars: 0,
                            mobsKilled: 380,
                            chestsFound: 4,
                            blocksWalked: 26083,
                            playtime: 1,
                            logins: 2,
                            deaths: 2,
                            discoveries: 7,
                            pvp: {
                              kills: 0,
                              deaths: 0,
                            },
                            gamemodes: [],
                            skillPoints: {
                              strength: 2,
                              intelligence: 2,
                            },
                            professions: {
                              fishing: {
                                level: 1,
                                levelPercent: 0,
                              },
                              woodcutting: {
                                level: 4,
                                levelPercent: 58,
                              },
                              mining: {
                                level: 1,
                                levelPercent: 0,
                              },
                              farming: {
                                level: 1,
                                levelPercent: 0,
                              },
                              scribing: {
                                level: 1,
                                levelPercent: 0,
                              },
                              jeweling: {
                                level: 1,
                                levelPercent: 0,
                              },
                              alchemism: {
                                level: 1,
                                levelPercent: 0,
                              },
                              cooking: {
                                level: 1,
                                levelPercent: 0,
                              },
                              weaponsmithing: {
                                level: 1,
                                levelPercent: 0,
                              },
                              tailoring: {
                                level: 1,
                                levelPercent: 0,
                              },
                              woodworking: {
                                level: 1,
                                levelPercent: 0,
                              },
                              armouring: {
                                level: 1,
                                levelPercent: 0,
                              },
                            },
                            dungeons: {
                              total: 0,
                              list: {},
                            },
                            raids: {
                              total: 0,
                              list: {},
                            },
                            questsCompleted: 1,
                            quests: ["King's Recruit"],
                          },
                        },
                        firstLogin: {
                          type: "number",
                          example: 1699106087,
                        },
                        global: {
                          type: "object",
                          properties: {
                            wars: {
                              type: "number",
                              example: 0,
                            },
                            totalLevels: {
                              type: "number",
                              example: 10,
                            },
                            mobsKilled: {
                              type: "number",
                              example: 380,
                            },
                            chestsFound: {
                              type: "number",
                              example: 4,
                            },
                            dungeons: {
                              type: "object",
                              properties: {
                                total: {
                                  type: "number",
                                  example: 0,
                                },
                                list: {
                                  type: "object",
                                  properties: {
                                    DUNGEON: {
                                      type: "number",
                                      example: 0,
                                    },
                                  },
                                },
                              },
                            },
                            raids: {
                              type: "object",
                              properties: {
                                total: {
                                  type: "number",
                                  example: 0,
                                },
                                list: {
                                  type: "object",
                                  properties: {
                                    DUNGEON: {
                                      type: "number",
                                      exampple: 0,
                                    },
                                  },
                                },
                              },
                            },
                            questsCompleted: {
                              type: "number",
                              example: 0,
                            },
                          },
                        },
                        guild: {
                          oneOf: [
                            {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                },
                                prefix: {
                                  type: "string",
                                },
                                rank: {
                                  type: "string",
                                },
                              },
                            },
                            {
                              type: "null",
                            },
                          ],
                          example: null,
                        },
                        lastLogin: {
                          type: "number",
                          example: 1699118622,
                        },
                        online: {
                          type: "boolean",
                          example: false,
                        },
                        playtime: {
                          type: "number",
                          description: "Playtime in Hours",
                          example: 1,
                        },
                        publicProfile: {
                          type: "boolean",
                          example: true,
                        },
                        purchasedRank: {
                          oneOf: [
                            {
                              type: "string",
                              enum: ["VIP", "VIP_PLUS", "HERO", "CHAMPION"],
                            },
                            {
                              type: "null",
                            },
                          ],
                          example: null,
                        },
                        rank: {
                          oneOf: [
                            {
                              type: "string",
                              enum: ["MEDIA", "MODERATOR", "ADMIN"],
                            },
                            {
                              type: "null",
                            },
                          ],
                          example: null,
                        },
                        server: {
                          oneOf: [
                            {
                              type: "string",
                            },
                            {
                              type: "null",
                            },
                          ],
                          example: null,
                        },
                        timestamp: {
                          type: "number",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/wynncraft/player/{PLAYER}/history": {
      get: {
        tags: ["Wynncraft"],
        summary: "Player History",
        description: "Returns alltime history of the specified Player. The returned data only shows object keys which have changed between the datapoints.",
        operationId: "getWynncraftPlayerHistory",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            $ref: "#/components/parameters/player",
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Player History.",
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
                    history: {
                      type: "array",
                      items: {
                        type: "object",
                      },
                      example: [
                        {
                          playtime: 9394,
                          global: {
                            wars: 8362,
                            totalLevels: 20264,
                            mobsKilled: 1990982,
                            chestsFound: 134769,
                          },
                          characters: {
                            b1b27f0ad7844e83829af23beca1f103: {
                              logins: 5703,
                            },
                          },
                          timestamp: 1699639115,
                        },
                        {
                          playtime: 9400,
                          global: {
                            wars: 8377,
                            totalLevels: 20266,
                            mobsKilled: 1991982,
                            chestsFound: 134772,
                          },
                          characters: {
                            "9a5cac7a4254442ca056558a1ff675e3": {
                              wars: 838,
                              mobsKilled: 20887,
                              blocksWalked: -1882465464,
                              playtime: 398,
                              logins: 5047,
                            },
                          },
                          timestamp: 1699707076,
                        },
                        {
                          playtime: 9457,
                          global: {
                            wars: 8496,
                            totalLevels: 20267,
                            mobsKilled: 2004825,
                            chestsFound: 134788,
                            raids: {
                              total: 588,
                              list: {
                                "The Canyon Colossus": 351,
                                "The Nameless Anomaly": 111,
                              },
                            },
                            questsCompleted: 1978,
                          },
                          characters: {
                            "9a5cac7a4254442ca056558a1ff675e3": {
                              wars: 907,
                              mobsKilled: 21348,
                              chestsFound: 1056,
                              blocksWalked: -1849210290,
                              playtime: 407,
                              logins: 5196,
                            },
                          },
                          timestamp: 1700137445,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/wynncraft/server/list": {
      get: {
        tags: ["Wynncraft"],
        summary: "Server List",
        description: "Returns a list of all current online Servers and its Players.",
        operationId: "getWynncraftServerList",
        security: [
          {
            "API-Key": [],
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Server List.",
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
                    servers: {
                      type: "object",
                      properties: {
                        SERVER: {
                          type: "object",
                          properties: {
                            playercount: {
                              type: "number",
                            },
                            players: {
                              type: "array",
                              uniqueItems: true,
                              items: {
                                type: "object",
                                properties: {
                                  UUID: {
                                    oneOf: [
                                      {
                                        type: "UUID",
                                      },
                                      {
                                        type: "null",
                                        description: "Null gets returned when the UUID translation failed",
                                      },
                                    ],
                                  },
                                  username: {
                                    type: "string",
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      example: {
                        WC1: {
                          playercount: 5,
                          players: [
                            {
                              UUID: "761ed6b8c16f46c5a5c354a66b673c7b",
                              username: "AlchabenKaker",
                            },
                            {
                              UUID: "1bcf9d80901a4d5bb603f2538d4bf454",
                              username: "AtaksDalo",
                            },
                            {
                              UUID: "05f912041c5a464b880603a82d0b9c18",
                              username: "Bluwu",
                            },
                            {
                              UUID: "2ba59e4767a34912b4d76693accd5275",
                              username: "CowPink",
                            },
                            {
                              UUID: "61ffb95837a34bc69caf607e63ec993b",
                              username: "eatbread",
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/wynncraft/server/{SERVER}": {
      get: {
        tags: ["Wynncraft"],
        summary: "Server",
        description: "Returns the specified Server and its Players.",
        operationId: "getWynncraftServer",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "Server",
            in: "path",
            schema: {
              type: "string",
              description: "Wynncraft Server ID",
              example: "WC1",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Server.",
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

                    playercount: {
                      type: "number",
                      example: 5,
                    },
                    players: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          UUID: {
                            oneOf: [
                              {
                                type: "UUID",
                              },
                              {
                                type: "null",
                                description: "Null gets returned when the UUID translation failed",
                              },
                            ],
                          },
                          username: {
                            type: "string",
                          },
                        },
                        example: [
                          {
                            UUID: "761ed6b8c16f46c5a5c354a66b673c7b",
                            username: "AlchabenKaker",
                          },
                          {
                            UUID: "1bcf9d80901a4d5bb603f2538d4bf454",
                            username: "AtaksDalo",
                          },
                          {
                            UUID: "05f912041c5a464b880603a82d0b9c18",
                            username: "Bluwu",
                          },
                          {
                            UUID: "2ba59e4767a34912b4d76693accd5275",
                            username: "CowPink",
                          },
                          {
                            UUID: "61ffb95837a34bc69caf607e63ec993b",
                            username: "eatbread",
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/wynncraft/server/{SERVER}/history": {
      get: {
        tags: ["Wynncraft"],
        summary: "Server History",
        description: "Returns the Server's alltime playercount history.",
        operationId: "getWynncraftServerHistory",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "Server",
            in: "path",
            schema: {
              type: "string",
              description: "Wynncraft Server ID",
              example: "WC1",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Server History.",
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
                    data: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          playercount: {
                            type: "number",
                          },
                          timestamp: {
                            type: "number",
                          },
                        },
                      },
                      example: [
                        {
                          playercount: 31,
                          timestamp: 1699638779,
                        },
                        {
                          playercount: 34,
                          timestamp: 1699642400,
                        },
                        {
                          playercount: 21,
                          timestamp: 1699646115,
                        },
                        {
                          playercount: 26,
                          timestamp: 1699649770,
                        },
                        {
                          playercount: 27,
                          timestamp: 1699702390,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
    "/v1/wynncraft/server/{SERVER}/history/{TIMEFRAME}": {
      get: {
        tags: ["Wynncraft"],
        summary: "Server Alltime History",
        description: "Returns the Server's playercount history for the specified timeframe.",
        operationId: "getWynncraftServerHistoryByTimeframe",
        security: [
          {
            "API-Key": [],
          },
        ],
        parameters: [
          {
            name: "Server",
            in: "path",
            schema: {
              type: "string",
              description: "Wynncraft Server ID",
              example: "WC1",
            },
          },
          {
            name: "timeframe",
            in: "path",
            schema: {
              type: "string",
              enum: ["hour", "day", "week", "month", "year"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Successfully retrieved Server History.",
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
                    data: {
                      type: "array",
                      uniqueItems: true,
                      items: {
                        type: "object",
                        properties: {
                          playercount: {
                            type: "number",
                          },
                          timestamp: {
                            type: "number",
                          },
                        },
                      },
                      example: [
                        {
                          playercount: 31,
                          timestamp: 1699638779,
                        },
                        {
                          playercount: 34,
                          timestamp: 1699642400,
                        },
                        {
                          playercount: 21,
                          timestamp: 1699646115,
                        },
                        {
                          playercount: 26,
                          timestamp: 1699649770,
                        },
                        {
                          playercount: 27,
                          timestamp: 1699702390,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": {
            $ref: "#/components/responses/accessForbidden",
          },
          "422": {
            $ref: "#/components/responses/invalidData",
          },
          "429": {
            $ref: "#/components/responses/ratelimited",
          },
        },
      },
    },
  },
};
