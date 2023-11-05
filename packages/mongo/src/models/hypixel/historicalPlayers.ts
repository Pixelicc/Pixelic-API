import { Schema } from "mongoose";
import { client } from "../../index.js";

const APISettingsSchema = new Schema(
  {
    onlineStatus: Boolean,
    winstreaks: Boolean,
  },
  { _id: false }
);

const rewardSchema = new Schema(
  {
    streak: Number,
    highestStreak: Number,
    claimedTotal: Number,
    claimedDaily: Number,
    tokens: Number,
  },
  { _id: false }
);

const socialMediaSchema = new Schema(
  {
    HYPIXEL: String,
    DISCORD: String,
    YOUTUBE: String,
    TWITCH: String,
    TWITTER: String,
    INSTAGRAM: String,
    TIKTOK: String,
  },
  { _id: false }
);

const statsSchema = new Schema(
  {
    Bedwars: Object,
    Skywars: Object,
    Duels: Object,
    Skyblock: Object,
    Arcade: Object,
    Arena: Object,
    Warlords: Object,
    BuildBattle: Object,
    TKR: Object,
    MurderMystery: Object,
    Pit: Object,
    TNT: Object,
    Blitz: Object,
    CvC: Object,
    Paintball: Object,
    Quake: Object,
    SpeedUHC: Object,
    Smash: Object,
    Walls: Object,
    MegaWalls: Object,
    VampireZ: Object,
    Woolwars: Object,
  },
  { _id: false, minimize: false }
);

const historicalPlayerSchema = new Schema(
  {
    UUID: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
    },
    rank: {
      type: String,
    },
    plusColor: {
      type: String,
    },
    plusPlusColor: {
      type: String,
    },
    APISettings: APISettingsSchema,
    EXP: {
      type: Number,
    },
    level: {
      type: Number,
    },
    karma: {
      type: Number,
    },
    achievementPoints: {
      type: Number,
    },
    questsCompleted: {
      type: Number,
    },
    challengesCompleted: {
      type: Number,
    },
    online: {
      type: Boolean,
    },
    firstLogin: {
      type: Number,
    },
    lastLogin: {
      type: Number,
    },
    lastLogout: {
      type: Number,
    },
    lastModePlayed: {
      type: String,
    },
    language: {
      type: String,
    },
    chatChannel: {
      type: String,
    },
    giftsSent: {
      type: Number,
    },
    giftsReceived: {
      type: Number,
    },
    ranksGifted: {
      type: Number,
    },
    rewards: rewardSchema,
    socialMedia: socialMediaSchema,
    stats: statsSchema,
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

export const HypixelHistoricalPlayerModel = client.useDb("Hypixel").model("historicalPlayers", historicalPlayerSchema);
