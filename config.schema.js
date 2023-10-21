/**
 * To run the Pixelic-API without any further problems it is recommended to fill out EVERY config field!
 *
 */
export default {
  database: {
    /**
     * MongoDB URI
     * @example mongodb://localhost:27017
     */
    mongoDB: "",
    /**
     * Redis URI
     * @example redis://localhost:6379
     */
    redis: "",
  },
  API: {
    /**
     * Port the API is running on
     */
    port: 3000,
    sentry: {
      /**
       * Your Sentry DSN for error tracking: https://sentry.io
       */
      dsn: "",
      /**
       * Your Sentry tracesSampleRate: https://docs.sentry.io/platforms/node/guides/express/configuration/options/#sample-rate
       */
      tracesSampleRate: 0.5,
    },
  },
  collector: {
    minecraft: {
      serverPlayercounts: true,
    },
    hypixel: {
      skyblock: {
        activeAuctions: true,
        endedAuctions: true,
        bazaar: true,
        election: true,
      },
    },
    wynncraft: {
      serverPlayercounts: true,
    },
  },
  mojang: {
    /**
     * Wether to create & maintain a UUIDList in Redis
     */
    UUIDList: true,
    /**
     * Wether to cache API responses in Redis
     */
    cache: true,
  },
  hypixel: {
    /**
     * Your Hypixel App's API-Key for accessing the Hypixel API: https://developer.hypixel.net/
     */
    key: "",
    /**
     * Your Hypixel App's API-Key ratelimit: https://developer.hypixel.net/
     * @default Personal Keys: 300
     * @default Production Keys: 600
     */
    limit: 300,
    /**
     * Wether to persist general data in MongoDB
     */
    persistData: true,
    /**
     * Wether to persist historical data in MongoDB
     */
    persistHistoricalData: true,
    /**
     * Wether to cache API responses in Redis
     */
    cache: true,
    webhooks: {
      /**
       * Triggered once a new player gets added to the MongoDB Database (required persistData to be enabled)
       */
      newPlayerEvent: {
        enabled: false,
        URL: "",
      },
      /**
       * Triggered once a new guild gets added to the MongoDB Database (required persistData to be enabled)
       */
      newGuildEvent: {
        enabled: false,
        URL: "",
      },
    },
  },
  wynncraft: {
    /**
     * Wether to persist general data in MongoDB
     */
    persistData: true,
    /**
     * Wether to persist historical data in MongoDB
     */
    persistHistoricalData: true,
    /**
     * Wether to cache API responses in Redis
     */
    cache: true,
    /**
     * List of supported **Discord** Webhooks
     */
    webhooks: {
      /**
       * Triggered once a new player gets added to the MongoDB Database (required persistData to be enabled)
       */
      newPlayerEvent: {
        enabled: false,
        URL: "",
      },
      /**
       * Triggered once a new guild gets added to the MongoDB Database (required persistData to be enabled)
       */
      newGuildEvent: {
        enabled: false,
        URL: "",
      },
    },
  },
  /**
   * The current environment the code is running in
   * Currently supported are "DEV" (Development) and "PROD" (Production)
   */
  environment: "DEV",
};
