import { Redis } from "ioredis";
import log from "@pixelic/logger";
import { config } from "@pixelic/utils";

const connection = new Redis(config.database.redis);

connection.once("ready", () => log("Redis", "Connection established", "info"));
var disconnected = false;
var initalConnect = true;
connection.on("error", () => {
  if (!disconnected) {
    log("Redis", "Connection closed", "error");
    disconnected = true;
    initalConnect = false;
  }
});
connection.on("ready", () => {
  if (!initalConnect) {
    log("Redis", "Connection reestablished", "info");
    disconnected = false;
  }
});

connection
  .call("FT.CREATE", "Hypixel.Skyblock.Auction", "ON", "JSON", "PREFIX", "1", "Hypixel:Auctions:", "SCHEMA", "$.seller", "AS", "seller", "TAG", "$.sellerProfile", "AS", "sellerProfile", "TAG", "$.coop", "AS", "coop", "TAG", "$.category", "AS", "category", "TAG", "$.bin", "AS", "bin", "TAG", "$.highestBid", "AS", "price", "NUMERIC", "$.item.name", "AS", "itemName", "TEXT", "$.item.tier", "AS", "itemTier", "TAG", "$.item.lore", "AS", "itemLore", "TEXT", "$.item.attributes.ID", "AS", "itemID", "TAG")
  .catch(() => {});

export default connection;
