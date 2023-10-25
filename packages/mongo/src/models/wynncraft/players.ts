import { Schema } from "mongoose";
import { client } from "../../index.js";

const playerSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  playtime: {
    type: Number,
    required: true,
  },
  firstLogin: {
    type: Number,
    required: true,
  },
  lastLogin: {
    type: Number,
    required: true,
  },
  online: {
    type: Boolean,
    required: true,
  },
  server: {
    type: String,
    required: true,
  },
  status: {
    type: Object,
    required: true,
  },
  rank: {
    type: String,
    required: true,
    index: true,
  },
  purchasedRank: {
    type: String,
    required: true,
    index: true,
  },
  global: {
    type: Object,
    required: true,
  },
  characters: {
    type: Object,
    required: true,
  },
  guild: {
    type: Object,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
});

export const WynncraftPlayerModel = client.useDb("Wynncraft").model("players", playerSchema);
