import mongoose from "mongoose";
import { config } from "@pixelic/utils";

mongoose.pluralize(null);
export const client = mongoose.createConnection(config.database.mongoDB);
