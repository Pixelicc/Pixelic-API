import { Schema } from "mongoose";
import { client } from "../../index.js";

const auctionTrackingSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  bin: {
    type: Boolean,
    required: true,
  },
  itemID: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    default: Math.floor(Date.now() / 1000),
    index: { expireAfterSeconds: 3600 },
  },
});

export const HypixelSkyblockAuctionTrackingModel = client.useDb("Hypixel").model("skyblockAuctionsPastHour", auctionTrackingSchema);
