import { Schema } from "mongoose";
import { client } from "../../index.js";

const historicalPlayerSchema = new Schema(
  {
    UUID: {
      type: String,
      required: true,
      index: true,
    },
    playtime: {
      type: Number,
      required: false,
    },
    global: {
      type: Object,
      required: false,
    },
    characters: {
      type: Object,
      required: false,
    },
  },
  { minimize: false }
);

export const WynncraftHistoricalPlayerModel = client.useDb("Wynncraft").model("historicalPlayers", historicalPlayerSchema);
