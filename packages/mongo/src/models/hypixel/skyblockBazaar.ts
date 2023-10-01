import { Schema } from "mongoose";
import { client } from "../../index.js";

const shortTermRetentionSchema = new Schema(
  {
    timestamp: { type: Date, required: true },
    meta: { type: String, required: true },
    data: {
      sellPrice: { type: Number, required: true },
      sellVolume: { type: Number, required: true },
      sellMovingWeek: { type: Number, required: true },
      sellOrders: { type: Number, required: true },
      buyPrice: { type: Number, required: true },
      buyVolume: { type: Number, required: true },
      buyMovingWeek: { type: Number, required: true },
      buyOrders: { type: Number, required: true },
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
      sellPrice: { type: Number, required: true },
      sellVolume: { type: Number, required: true },
      sellMovingWeek: { type: Number, required: true },
      sellOrders: { type: Number, required: true },
      buyPrice: { type: Number, required: true },
      buyVolume: { type: Number, required: true },
      buyMovingWeek: { type: Number, required: true },
      buyOrders: { type: Number, required: true },
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
  shortTerm: client.useDb("Hypixel").model("skyblockBazaarShortTerm", shortTermRetentionSchema),
  longTerm: client.useDb("Hypixel").model("skyblockBazaarLongTerm", longTermRetentionSchema),
};
