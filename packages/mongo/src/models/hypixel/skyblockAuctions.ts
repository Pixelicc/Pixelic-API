import { Schema } from "mongoose";
import { client } from "../../index.js";

const attributeSchema = new Schema(
  {
    ID: {
      type: String,
      required: true,
    },
    UUID: {
      type: String,
      required: false,
      index: true,
    },
    timestamp: {
      type: Number,
      required: false,
    },
  },
  { strict: false, _id: false }
);

const itemSchema = new Schema(
  {
    count: {
      type: Number,
      required: true,
    },
    lore: {
      type: Array,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    reforge: {
      type: String,
    },
    tier: {
      type: String,
    },
    attributes: attributeSchema,
  },
  { strict: false, _id: false }
);

const retentionSchema = new Schema(
  {
    timestamp: { type: Date, required: true },
    meta: { type: String, required: true },
    data: {
      UUID: { type: String, required: true, index: true },
      sellerProfile: { type: String, required: true, index: true },
      buyer: { type: String, required: true, index: true },
      price: { type: Number, required: true },
      bin: { type: Boolean, required: true },
      item: { type: itemSchema, required: true },
    },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "meta",
      granularity: "hours",
    },
  }
);

export const HypixelSkyblockAuctionModel = client.useDb("Hypixel").model("skyblockAuctions", retentionSchema);
