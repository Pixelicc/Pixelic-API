import { Schema } from "mongoose";
import { client } from "../../index.js";

const shortTermRetentionSchema = new Schema(
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
      granularity: "minutes",
    },
    expireAfterSeconds: 60 * 60 * 24 * 30,
  }
);

const longTermRetentionSchema = new Schema(
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

export const HypixelSkyblockBazaarModel = {
  shortTerm: client.useDb("Hypixel").model("skyblockAuctionhouseShortTerm", shortTermRetentionSchema),
  longTerm: client.useDb("Hypixel").model("skyblockAuctionhouseLongTerm", longTermRetentionSchema),
};
