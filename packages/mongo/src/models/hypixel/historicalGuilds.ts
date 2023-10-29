import { Schema } from "mongoose";
import { client } from "../../index.js";

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

const historicalGuildSchema = new Schema(
  {
    ID: {
      type: String,
      required: true,
      index: true,
    },
    name: String,
    description: String,
    tag: String,
    tagColor: String,
    EXP: Number,
    level: Number,
    publiclyListed: Boolean,
    weeklyEXP: Number,
    cappedWeeklyEXP: Number,
    EXPHistory: { type: Object, default: undefined },
    cappedEXPHistory: { type: Object, default: undefined },
    created: Number,
    ranks: { type: Array, default: undefined },
    memberCount: Number,
    members: { type: Object, default: undefined },
    preferredGames: { type: Array, default: undefined },
    EXPPerGame: { type: Object, default: undefined },
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
  },
  { minimize: false }
);

export const HypixelHistoricalGuildModel = client.useDb("Hypixel").model("historicalGuilds", historicalGuildSchema);
