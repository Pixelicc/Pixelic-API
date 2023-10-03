import { Schema } from "mongoose";
import { client } from "../../index.js";

const shortTermRetentionSchema = new Schema(
  {
    timestamp: { type: Date, required: true },
    meta: { type: String, required: true },
    data: { type: Number, required: true },
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
    data: { type: Number, required: true },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "meta",
      granularity: "hours",
    },
  }
);

export const WynncraftServerPlayercountModel = {
  shortTerm: client.useDb("Wynncraft").model("serverPlayercountsShortTerm", shortTermRetentionSchema),
  longTerm: client.useDb("Wynncraft").model("serverPlayercountsLongTerm", longTermRetentionSchema),
};
