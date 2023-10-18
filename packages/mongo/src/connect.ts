import mongoose from "mongoose";
import log from "@pixelic/logger";
import { config } from "@pixelic/utils";

mongoose.pluralize(null);

var initalConnect = true;
const connect = async () => {
  try {
    await mongoose.connect(config.database.mongoDB, { connectTimeoutMS: 5000 });
    initalConnect = false;
  } catch {
    if (initalConnect) log("Mongo", "Connection not establishable", "error");
    connect();
  }
};

mongoose.connection.setMaxListeners(0);
mongoose.connection.once("connected", () => log("Mongo", "Connection established", "info"));
mongoose.connection.on("disconnected", () => {
  if (!initalConnect) log("Mongo", "Connection closed", "error");
});
mongoose.connection.on("reconnected", () => log("Mongo", "Connection reestablished", "info"));

connect();

export const client = mongoose.connection;
