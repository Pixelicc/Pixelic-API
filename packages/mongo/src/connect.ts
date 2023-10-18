import mongoose from "mongoose";
import log from "@pixelic/logger";
import { config } from "@pixelic/utils";

mongoose.pluralize(null);

const connection = mongoose.createConnection(config.database.mongoDB);
connection.setMaxListeners(0);
connection.once("connected", () => log("Mongo", "Connection established", "info"));
connection.on("disconnected", () => log("Mongo", "Connection closed", "error"));
connection.on("reconnected", () => log("Mongo", "Connection reestablished", "info"));

export const client = connection;
