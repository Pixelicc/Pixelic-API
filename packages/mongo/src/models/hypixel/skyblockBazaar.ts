import { Schema } from "mongoose";
import { client } from "../../index.js";

const hourlyBazaarSchema = new Schema(
  { timestamp: Date, data: Object },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "data",
      granularity: "minutes",
    },
    expireAfterSeconds: 3600,
  }
);

const dailyBazaarSchema = new Schema(
  { timestamp: Date, data: Object },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "data",
      granularity: "minutes",
    },
    expireAfterSeconds: 86400,
  }
);

const weeklyBazaarSchema = new Schema(
  { timestamp: Date, data: Object },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "data",
      granularity: "minutes",
    },
    expireAfterSeconds: 86400 * 7,
  }
);

const monthlyBazaarSchema = new Schema(
  { timestamp: Date, data: Object },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "data",
      granularity: "hours",
    },
    expireAfterSeconds: 86400 * 30,
  }
);

const alltimeBazaarSchema = new Schema(
  { timestamp: Date, data: Object },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "data",
      granularity: "hours",
    },
  }
);

export const HypixelSkyblockBazaarModel = {
  hourly: client.useDb("Hypixel").model("skyblockBazaarHourly", hourlyBazaarSchema),
  daily: client.useDb("Hypixel").model("skyblockBazaarDaily", dailyBazaarSchema),
  weekly: client.useDb("Hypixel").model("skyblockBazaarWeekly", weeklyBazaarSchema),
  monthly: client.useDb("Hypixel").model("skyblockBazaarMonthly", monthlyBazaarSchema),
  alltime: client.useDb("Hypixel").model("skyblockBazaarAlltime", alltimeBazaarSchema),
};
