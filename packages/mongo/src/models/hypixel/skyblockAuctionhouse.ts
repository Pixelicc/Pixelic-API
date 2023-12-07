import { Schema } from "mongoose";
import { client } from "../../index.js";

const retentionSchema = new Schema(
  {
    timestamp: { type: Date, required: true },
    meta: { type: String, required: true },
    data: {
      maxPrice: { type: Number, required: true },
      minPrice: { type: Number, required: true },
      averagePrice: { type: Number, required: true },
      medianPrice: { type: Number, required: true },
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

export const HypixelSkyblockAuctionhouseModel = client.useDb("Hypixel").model("skyblockAuctionhouseItems", retentionSchema);
