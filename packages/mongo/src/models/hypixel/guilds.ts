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
  { required: true, _id: false }
);

const memberSchema = new Schema(
  {
    UUID: { type: String },
    rank: { type: String },
    joined: { type: Number },
    questParticipation: { type: Number },
    weeklyEXP: { type: Number },
    EXPHistory: { type: Object },
    mutedTill: { type: Number },
  },
  { required: true, _id: false }
);

const achievementsSchema = new Schema(
  {
    experienceKings: {
      type: Number,
      required: true,
    },
    winners: {
      type: Number,
      required: true,
    },
    onlinePlayers: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const guildSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  tagColor: {
    type: String,
    required: true,
  },
  EXP: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  publiclyListed: {
    type: Boolean,
    required: true,
  },
  weeklyEXP: {
    type: Number,
    required: true,
  },
  cappedWeeklyEXP: {
    type: Number,
    required: true,
  },
  EXPHistory: {
    type: Object,
    required: true,
  },
  cappedEXPHistory: {
    type: Object,
    required: true,
  },
  created: {
    type: Number,
    required: true,
  },
  ranks: [rankSchema],
  memberCount: {
    type: Number,
    required: true,
  },
  members: [memberSchema],
  preferredGames: {
    type: Array,
    required: true,
  },
  EXPPerGame: {
    type: Object,
    required: true,
  },
  achievements: achievementsSchema,
  timestamp: {
    type: Number,
    required: true,
  },
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

export const HypixelGuildModel = client.useDb("Hypixel").model("guilds", guildSchema);
