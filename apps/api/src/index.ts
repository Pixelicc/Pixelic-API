import express from "express";
import * as Sentry from "@sentry/node";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import { requestID, serverID, JSONHandler, requestAnalytics, defaultNoCacheHeaders } from "@pixelic/middlewares";
import { config, generateULID } from "@pixelic/utils";
import log from "@pixelic/logger";
import router from "./routes/index.js";

const API = express();

Sentry.init({
  dsn: config.sentry.dsn,
  integrations: [
    new Sentry.Integrations.Http({
      tracing: false,
      breadcrumbs: true,
    }),
    new Sentry.Integrations.Express({
      app: API,
    }),
    new Sentry.Integrations.Mongo({
      useMongoose: true,
    }),
  ],
  tracesSampleRate: config.sentry.tracesSampleRate,
  normalizeDepth: 3,
  environment: config.environment,
});

Sentry.setTag("App", "API");

API.use(Sentry.Handlers.requestHandler());
API.use(Sentry.Handlers.tracingHandler());

API.disable("etag");

API.use(mongoSanitize(), cors(), requestID, serverID(generateULID()), requestAnalytics, express.json(), JSONHandler, defaultNoCacheHeaders);

API.use(router);

API.get("/health", async (req, res) => {
  return res.set("Cache-Control", "public, max-age=10").status(200).json({ success: true });
});

API.all("/*", async (req, res) => {
  return res.status(404).json({ success: false, cause: "Unkown Endpoint" });
});

API.use(Sentry.Handlers.errorHandler());

API.listen(config.API.port);

log("API", `Listening on port ${config.API.port} ...`, "info");
