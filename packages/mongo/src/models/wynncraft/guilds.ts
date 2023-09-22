import { Schema } from "mongoose";
import { client } from "../../index.js";

const guildSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    required: true,
  },
  members: [
    {
      username: { type: String },
      UUID: { type: String },
      rank: { type: String },
      contributed: { type: Number },
      joined: { type: Number },
    },
  ],
  GEXP: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  created: {
    type: Number,
    required: true,
  },
  territories: {
    type: String,
    required: true,
  },
  banner: {
    type: Object,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
});

export const WynncraftGuildModel = client.useDb("Wynncraft").model("guilds", guildSchema);
