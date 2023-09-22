import mongoose from "mongoose";
import { config } from "@pixelic/utils";

mongoose.pluralize(null);

const connection = mongoose.createConnection(config.database.mongoDB);
connection.setMaxListeners(0);

export const client = connection;
