import { Schema } from "mongoose";
import { client } from "../index.js";
import { APIKeyMongo } from "@pixelic/types";

const requestSchema = new Schema(
  {
    ID: { type: String, index: true },
    URL: { type: String },
    method: { type: String, enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
    userAgent: { type: String },
    IP: { type: String },
  },
  { _id: false }
);

const keySchema = new Schema<APIKeyMongo>({
  owner: {
    type: String,
    required: true,
    index: true,
  },
  requestHistory: [requestSchema],
});

export const APIKeyModel = client.useDb("API").model<APIKeyMongo>("API-Key", keySchema);
