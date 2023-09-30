import { Schema } from "mongoose";
import { client } from "../../index.js";

const rankSchema = new Schema(
  {
    name: { type: String },
    tag: { type: String },
    default: { type: Boolean },
    created: { type: Number },
    priority: { type: Number },
  },
  { _id: false }
);

const memberSchema = new Schema(
  {
    UUID: { type: String },
    rank: { type: String },
    joined: { type: Number },
    questParticipation: { type: Number },
    EXPHistory: { type: Object },
    mutedTill: { type: Number },
  },
  { _id: false }
);

const achievementsSchema = new Schema(
  {
    experienceKings: {
      type: Number,
    },
    winners: {
      type: Number,
    },
    onlinePlayers: {
      type: Number,
    },
  },
  { _id: false }
);

const historicalGuildSchema = new Schema({
  ID: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  tag: {
    type: String,
  },
  tagColor: {
    type: String,
  },
  EXP: {
    type: Number,
  },
  level: {
    type: Number,
  },
  publiclyListed: {
    type: Boolean,
  },
  EXPHistory: {
    type: Object,
  },
  created: {
    type: Number,
  },
  ranks: { type: [rankSchema], default: undefined },
  memberCount: {
    type: Number,
  },
  members: { type: [memberSchema], default: undefined },
  preferredGames: {
    type: Array,
    default: undefined,
  },
  EXPPerGame: {
    type: Object,
  },
  achievements: achievementsSchema,
  /**
   * Shows wether the current data was ingested by the libary itself or a third-party source
   */
  thirdParty: {
    type: Boolean,
    required: false,
    index: { sparse: true },
  },
  thirdPartySource: {
    type: String,
    required: false,
    index: { sparse: true },
  },
});

export const HypixelHistoricalGuildModel = client.useDb("Hypixel").model("historicalGuilds", historicalGuildSchema);
