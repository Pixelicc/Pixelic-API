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
  onlineMembers: {
    type: String,
    required: true,
  },
  members: [
    {
      username: { type: String },
      UUID: { type: String },
      rank: { type: String },
      online: { type: Boolean },
      server: { type: String },
      contributed: { type: Number },
      joined: { type: Number },
    },
    { _id: false },
  ],
  level: {
    type: Number,
    required: true,
  },
  EXPPercent: {
    type: Number,
    required: true,
  },
  created: {
    type: Number,
    required: true,
  },
  territories: {
    type: Number,
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
