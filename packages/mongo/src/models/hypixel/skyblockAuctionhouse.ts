import { Schema } from "mongoose";
import { client } from "../../index.js";

const hourlyAuctionhouseSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
    index: { expireAfterSeconds: 86400 },
  },
});

const dailyAuctionhouseSchema = new Schema(
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

const weeklyAuctionhouseSchema = new Schema(
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

const monthlyAuctionhouseSchema = new Schema(
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

const alltimeAuctionhouseSchema = new Schema(
  { timestamp: Date, data: Object },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "data",
      granularity: "hours",
    },
  }
);

export const HypixelSkyblockAuctionhouseModel = {
  hourly: client.useDb("Hypixel").model("skyblockAuctionhouseHourly", hourlyAuctionhouseSchema),
  daily: client.useDb("Hypixel").model("skyblockAuctionhouseDaily", dailyAuctionhouseSchema),
  weekly: client.useDb("Hypixel").model("skyblockAuctionhouseWeekly", weeklyAuctionhouseSchema),
  monthly: client.useDb("Hypixel").model("skyblockAuctionhouseMonthly", monthlyAuctionhouseSchema),
  alltime: client.useDb("Hypixel").model("skyblockAuctionhouseAlltime", alltimeAuctionhouseSchema),
};
