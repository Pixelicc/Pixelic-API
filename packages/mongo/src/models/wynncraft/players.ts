import { Schema } from "mongoose";
import { client } from "../../index.js";

const globalSchema = new Schema(
  {
    wars: { type: Number, required: true },
    totalLevels: { type: Number, required: true },
    mobsKilled: { type: Number, required: true },
    chestsFound: { type: Number, required: true },
    dungeons: {
      total: { type: Number, required: true },
      list: { type: Object, required: true },
    },
    raids: {
      total: { type: Number, required: true },
      list: { type: Object, required: true },
    },
    questsCompleted: { type: Number, required: true },
    pvp: {
      kills: { type: Number, required: true },
      deaths: { type: Number, required: true },
    },
  },
  { _id: false, minimize: false }
);

const characterSchema = new Schema(
  {
    UUID: { type: String, required: true },
    class: { type: String, required: true },
    nick: { type: String, required: true },
    level: { type: Number, required: true },
    totalLevels: { type: Number, required: true },
    EXP: { type: Number, required: true },
    levelPercent: { type: Number, required: true },
    wars: { type: Number, required: true },
    mobsKilled: { type: Number, required: true },
    chestsFound: { type: Number, required: true },
    blocksWalked: { type: Number, required: true },
    playtime: { type: Number, required: true },
    logins: { type: Number, required: true },
    deaths: { type: Number, required: true },
    discoveries: { type: Number, required: true },
    pvp: {
      kills: { type: Number, required: true },
      deaths: { type: Number, required: true },
    },
    gamemodes: { type: [String], required: true },
    skillPoints: {
      strength: { type: Number, required: true },
      intelligence: { type: Number, required: true },
    },
    professions: {
      fishing: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      woodcutting: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      mining: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      farming: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      scribing: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      jeweling: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      alchemism: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      cooking: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      weaponsmithing: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      tailoring: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      woodworking: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
      armouring: {
        level: { type: Number, required: true },
        levelPercent: { type: Number, required: true },
      },
    },
    dungeons: {
      total: { type: Number, required: true },
      list: { type: Object, required: true },
    },
    raids: {
      total: { type: Number, required: true },
      list: { type: Object, required: true },
    },
    questsCompleted: { type: Number, required: true },
    quests: { type: [String], required: true },
  },
  { _id: false, minimize: false }
);

const guildSchema = new Schema(
  {
    name: { type: String, required: true },
    prefix: { type: String, required: true },
    rank: { type: String, required: true },
  },
  { _id: false }
);

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
    type: globalSchema,
    required: true,
  },
  characters: {
    type: [characterSchema],
    required: true,
  },
  guild: {
    type: guildSchema,
    required: true,
  },
  publicProfile: {
    type: Boolean,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
});

export const WynncraftPlayerModel = client.useDb("Wynncraft").model("players", playerSchema);
