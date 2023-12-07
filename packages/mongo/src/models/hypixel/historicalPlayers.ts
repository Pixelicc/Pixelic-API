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

const tourneySchema = new Schema(
  {
    tributes: Number,
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
    data: {
      username: String,
      rank: String,
      plusColor: String,
      plusPlusColor: String,
      APISettings: APISettingsSchema,
      EXP: Number,
      level: Number,
      karma: Number,
      achievementPoints: Number,
      questsCompleted: Number,
      challengesCompleted: Number,
      online: Boolean,
      firstLogin: Number,
      lastLogin: Number,
      lastLogout: Number,
      lastModePlayed: String,
      language: String,
      chatChannel: String,
      giftsSent: Number,
      giftsReceived: Number,
      ranksGifted: Number,
      rewards: rewardSchema,
      socialMedia: socialMediaSchema,
      tourney: tourneySchema,
      stats: statsSchema,
    },
    /**
     * Shows wether the current data was ingested by the libary itself or a third-party source
     */
    thirdParty: {
      type: Boolean,
      index: { sparse: true },
    },
    thirdPartySource: {
      type: String,
      index: { sparse: true },
    },
    isFullData: {
      type: Boolean,
      index: { sparse: true },
    },
  },
  { minimize: false }
);

export const HypixelHistoricalPlayerModel = client.useDb("Hypixel").model("historicalPlayers", historicalPlayerSchema);
