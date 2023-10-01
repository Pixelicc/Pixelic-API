import express from "express";
import * as Sentry from "@sentry/node";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import { requestID, JSONHandler, requestAnalytics } from "@pixelic/middlewares";
import { config } from "@pixelic/utils";
import router from "./routes/index.js";

const API = express();

Sentry.init({
  dsn: config.API.sentry.dsn,
  integrations: [
    new Sentry.Integrations.Http({
      tracing: false,
      breadcrumbs: true,
    }),
    new Sentry.Integrations.Express({
      app: API,
    }),
  ],
  tracesSampleRate: config.API.sentry.tracesSampleRate,
  normalizeDepth: 3,
  environment: config.environment,
});

API.use(Sentry.Handlers.requestHandler());
API.use(Sentry.Handlers.tracingHandler());

API.disable("etag");

API.use(mongoSanitize(), cors(), requestID, requestAnalytics, express.json(), JSONHandler);

API.use(router);

API.get("/health", async (req, res) => {
  return res.set("cache-control", "public, max-age=10").status(200).json({ success: true });
});

API.all("/*", async (req, res) => {
  return res.status(404).json({ success: false, cause: "Unkown Endpoint" });
});

API.use(Sentry.Handlers.errorHandler());

API.listen(config.API.port);