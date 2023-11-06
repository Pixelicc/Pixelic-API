import { Schema } from "mongoose";
import { client } from "../../index.js";

const memberSchema = new Schema(
  {
    username: { type: String, required: true },
    UUID: { type: String, required: true },
    rank: { type: String, required: true },
    online: { type: Boolean, required: true },
    server: { type: String, required: true },
    contributed: { type: Number, required: true },
    joined: { type: Number, required: true },
  },
  { _id: false }
);

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
  members: {
    type: [memberSchema],
    required: true,
  },
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
