import { Schema } from "mongoose";
import { client } from "../../index.js";

const shortTermRetentionSchema = new Schema(
  {
    timestamp: { type: Date, required: true },
    meta: { type: String, required: true },
    data: {
      playercount: { type: Number, required: true },
      latency: { type: Number, required: true },
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
      playercount: { type: Number, required: true },
      latency: { type: Number, required: true },
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

export const MinecraftServerPlayercountModel = {
  shortTerm: client.useDb("Minecraft").model("serverPlayercountsShortTerm", shortTermRetentionSchema),
  longTerm: client.useDb("Minecraft").model("serverPlayercountsLongTerm", longTermRetentionSchema),
};
