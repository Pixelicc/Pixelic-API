import cluster from "node:cluster";
import log from "@pixelic/logger";
import { config } from "@pixelic/utils";

if (cluster.isPrimary) {
  log("API", `Primary ${process.pid} started...`, "info");

  const threads = config.environment === "DEV" ? config.API.threads.DEV : config.API.threads.PROD;
  for (var i = 0; i < threads; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    log("API", `Worker ${worker.process.pid} died...`, "error");
    cluster.fork();
  });
} else {
  log("API", `Worker ${process.pid} started...`, "info");
  import("./workers/API.js");
}
