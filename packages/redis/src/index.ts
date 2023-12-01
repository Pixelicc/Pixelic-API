import { Redis } from "ioredis";
import log from "@pixelic/logger";
import { config } from "@pixelic/utils";

const connection = new Redis(config.database.redis);

var disconnected = false;
var initalConnect = true;
connection.once("ready", () => {
  log("Redis", "Connection established", "info");
  setTimeout(() => (initalConnect = false), 100);
});
connection.on("error", () => {
  if (!disconnected) {
    if (initalConnect) {
      log("Redis", "Connection not establishable", "error");
    } else {
      log("Redis", "Connection closed", "error");
    }
    disconnected = true;
  }
});
connection.on("ready", () => {
  if (!initalConnect) {
    log("Redis", "Connection reestablished", "info");
    disconnected = false;
  }
});

connection
  .call("FT.CREATE", "Hypixel.Skyblock.Auction", "ON", "JSON", "PREFIX", "1", "Hypixel:Skyblock:Auctions:", "SCHEMA", "$.seller", "AS", "seller", "TAG", "$.sellerProfile", "AS", "sellerProfile", "TAG", "$.coop", "AS", "coop", "TAG", "$.category", "AS", "category", "TAG", "$.bin", "AS", "bin", "TAG", "$.highestBid", "AS", "price", "NUMERIC", "$.item.cleanName", "AS", "itemName", "TEXT", "$.item.tier", "AS", "itemTier", "TAG", "$.item.cleanLore", "AS", "itemLore", "TEXT", "$.item.ID", "AS", "itemID", "TAG")
  .catch(() => {});

export default connection;
