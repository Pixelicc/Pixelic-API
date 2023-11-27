import { Schema } from "mongoose";
import { client } from "../../index.js";

const itemSchema = new Schema(
  {
    count: Number,
    name: String,
    tier: String,
    ID: {
      type: String,
      required: true,
    },
    UUID: {
      type: String,
      index: {
        sparse: true,
      },
    },
    timestamp: Number,
    attributes: Object,
  },
  { _id: false }
);

const auctionSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  seller: {
    type: String,
    required: true,
    index: true,
  },
  sellerProfile: {
    type: String,
    required: true,
    index: true,
  },
  buyer: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  bin: {
    type: Boolean,
    required: true,
  },
  item: {
    type: itemSchema,
    required: true,
  },
});

export const HypixelSkyblockAuctionModel = client.useDb("Hypixel").model("skyblockAuctions", auctionSchema);
