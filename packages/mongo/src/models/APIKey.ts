import { Schema } from "mongoose";
import { client } from "../index.js";
import { APIKeyMongo } from "@pixelic/types";

const keySchema = new Schema<APIKeyMongo>({
  owner: {
    type: String,
    required: true,
    index: true,
  },
  usageHistory: {
    type: Object,
  },
  requestHistory: [
    {
      ID: { type: String, index: true },
      URL: { type: String },
      method: { type: String, enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
      userAgent: { type: String },
      IP: { type: String },
      key: { type: String },
    },
  ],
});

export const APIKeyModel = client.useDb("API").model<APIKeyMongo>("API-Key", keySchema);
