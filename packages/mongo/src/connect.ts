import mongoose from "mongoose";
import { config } from "@packages/utils";

mongoose.pluralize(null);
export const client = mongoose.createConnection(config.database.mongoDB);
