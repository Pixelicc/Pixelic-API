import { Schema } from "mongoose";
import { client } from "../../index.js";

const historicalPlayerSchema = new Schema(
  {
    UUID: {
      type: String,
      required: true,
      index: true,
    },
    data: {
      username: String,
      playtime: Number,
      firstLogin: Number,
      lastLogin: Number,
      online: Boolean,
      server: String,
      rank: String,
      purchasedRank: String,
      global: Object,
      characters: Object,
      guild: Object,
      publicProfile: Boolean,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    isFullData: {
      type: Boolean,
      index: { sparse: true },
    },
  },
  { minimize: false }
);

export const WynncraftHistoricalPlayerModel = client.useDb("Wynncraft").model("historicalPlayers", historicalPlayerSchema);
