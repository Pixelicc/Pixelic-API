import { Schema } from "mongoose";
import { client } from "../../index.js";

const APISettingsSchema = new Schema(
  {
    onlineStatus: {
      type: Boolean,
      required: true,
    },
    winstreaks: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const rewardSchema = new Schema(
  {
    streak: {
      type: Number,
      required: true,
    },
    highestStreak: {
      type: Number,
      required: true,
    },
    claimedTotal: {
      type: Number,
      required: true,
    },
    claimedDaily: {
      type: Number,
      required: true,
    },
    tokens: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const socialMediaSchema = new Schema(
  {
    HYPIXEL: {
      type: String,
      required: true,
    },
    DISCORD: {
      type: String,
      required: true,
    },
    YOUTUBE: {
      type: String,
      required: true,
    },
    TWITCH: {
      type: String,
      required: true,
    },
    TWITTER: {
      type: String,
      required: true,
    },
    INSTAGRAM: {
      type: String,
      required: true,
    },
    TIKTOK: {
      type: String,
      required: true,
    },
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
    Bedwars: {
      type: Object,
      required: true,
    },
    Skywars: {
      type: Object,
      required: true,
    },
    Duels: {
      type: Object,
      required: true,
    },
    Skyblock: {
      type: Object,
      required: true,
    },
    Arcade: {
      type: Object,
      required: true,
    },
    Arena: {
      type: Object,
      required: true,
    },
    Warlords: {
      type: Object,
      required: true,
    },
    BuildBattle: {
      type: Object,
      required: true,
    },
    TKR: {
      type: Object,
      required: true,
    },
    MurderMystery: {
      type: Object,
      required: true,
    },
    Pit: {
      type: Object,
      required: true,
    },
    TNT: {
      type: Object,
      required: true,
    },
    Blitz: {
      type: Object,
      required: true,
    },
    CvC: {
      type: Object,
      required: true,
    },
    Paintball: {
      type: Object,
      required: true,
    },
    Quake: {
      type: Object,
      required: true,
    },
    SpeedUHC: {
      type: Object,
      required: true,
    },
    Smash: {
      type: Object,
      required: true,
    },
    Walls: {
      type: Object,
      required: true,
    },
    MegaWalls: {
      type: Object,
      required: true,
    },
    VampireZ: {
      type: Object,
      required: true,
    },
    Woolwars: {
      type: Object,
      required: true,
    },
  },
  { _id: false, minimize: false }
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
  rank: {
    type: String,
    required: true,
    index: true,
  },
  plusColor: {
    type: String,
    required: true,
  },
  plusPlusColor: {
    type: String,
    required: true,
  },
  APISettings: {
    type: APISettingsSchema,
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
  karma: {
    type: Number,
    required: true,
  },
  achievementPoints: {
    type: Number,
    required: true,
  },
  questsCompleted: {
    type: Number,
    required: true,
  },
  challengesCompleted: {
    type: Number,
    required: true,
  },
  online: {
    type: Boolean,
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
  lastLogout: {
    type: Number,
    required: true,
  },
  lastModePlayed: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    index: true,
  },
  chatChannel: {
    type: String,
    required: true,
  },
  giftsSent: {
    type: Number,
    required: true,
  },
  giftsReceived: {
    type: Number,
    required: true,
  },
  ranksGifted: {
    type: Number,
    required: true,
  },
  rewards: {
    type: rewardSchema,
    required: true,
  },
  socialMedia: {
    type: socialMediaSchema,
    required: true,
  },
  tourney: {
    type: tourneySchema,
    required: true,
  },
  stats: {
    type: statsSchema,
    required: true,
  },
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

export const HypixelPlayerModel = client.useDb("Hypixel").model("players", playerSchema);
