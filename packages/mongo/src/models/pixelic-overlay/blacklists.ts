import { Schema } from "mongoose";
import { client } from "../../index.js";

const blacklistEntrySchema = new Schema(
  {
    UUID: { type: String, required: true, index: true },
    reason: { type: String, enum: ["CHEATING", "SNIPING"], required: true },
    timestamp: { type: Number, required: true },
  },
  { _id: false }
);

const blacklistSchema = new Schema(
  {
    _id: String,
    owner: {
      type: String,
      required: true,
      index: true,
    },
    entries: { type: [blacklistEntrySchema], default: [] },
    timestamp: { type: Number, required: true },
    lastUpdated: { type: Number, required: true },
    updates: { type: Number, default: 0 },
  },
  { minimize: false }
);

export const PixelicOverlayBlacklistModel = client.useDb("Pixelic-Overlay").model("blacklists", blacklistSchema);
