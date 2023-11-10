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
    "/v1/hypixel/skyblock/auctionhouse/query": {
      get: {
        tags: ["Hypixel (Skyblock)"],
        summary: "Query Auctions",
        operationId: "queryHypixelSkyblockAuctions",
        security: [
          {
            "API-Key": ["hypixel:queryAuctions"],
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
            description: "Successfully queried Hypixel Skyblock Auctions",
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
                            attributes: {
                              timestamp: 1699349580,
                              ID: "KAT_FLOWER",
                              UUID: "992e352e898d4d05b2ac1516fad5832a",
                            },
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
                            attributes: {
                              backpack_color: "DEFAULT",
                              timestamp: 1699349640,
                              ID: "GREATER_BACKPACK",
                              UUID: "f29c94df5a9940449092f67b6fcf43a8",
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
                    data: {
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
                            reforge: "ANCIENT",
                            tier: "MYTHIC",
                            attributes: {
                              ID: "SPEED_WITHER_BOOTS",
                              UUID: "e813edbeb3be4946936a402899d5e818",
                              timestamp: 1611916680,
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
                            reforge: "ANCIENT",
                            tier: "MYTHIC",
                            attributes: {
                              ID: "POWER_WITHER_LEGGINGS",
                              UUID: "8b9a99cb858c4644b1cb3666c1fe5fe2",
                              timestamp: 1633113060,
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
                    data: {
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
                            reforge: "ANCIENT",
                            tier: "MYTHIC",
                            attributes: {
                              ID: "SPEED_WITHER_BOOTS",
                              UUID: "e813edbeb3be4946936a402899d5e818",
                              timestamp: 1611916680,
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
                            reforge: "ANCIENT",
                            tier: "MYTHIC",
                            attributes: {
                              ID: "POWER_WITHER_LEGGINGS",
                              UUID: "8b9a99cb858c4644b1cb3666c1fe5fe2",
                              timestamp: 1633113060,
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
        summary: "Item Auction History",
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
                    data: {
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
                            attributes: {
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
                              timestamp: 1657288620,
                              ID: "SORROW_HELMET",
                              UUID: "12b48efea327492a9d1e56dd15c74573",
                            },
                            reforge: "Wise",
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
                            attributes: {
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
                              timestamp: 1657288620,
                              ID: "SORROW_HELMET",
                              UUID: "12b48efea327492a9d1e56dd15c74573",
                            },
                            reforge: "Wise",
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
        summary: "Item Auction Price",
        description: "Returns the current price of the specified Skyblock Item.",
        operationId: "getCurrentHypixelSkyblockItemPrice",
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
        summary: "Item Auction Price History",
        description: "Returns alltime price history of the specified Skyblock Item.",
        operationId: "getAllHypixelSkyblockItemPriceHistory",
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
                    data: {
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
  },
};
