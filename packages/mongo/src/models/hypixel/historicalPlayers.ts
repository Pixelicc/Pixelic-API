import { Schema } from "mongoose";
import { client } from "../../index.js";

const APISettingsSchema = new Schema(
  {
    onlineStatus: {
      type: Boolean,
    },
    winstreaks: {
      type: Boolean,
    },
  },
  { _id: false }
);

const rewardSchema = new Schema(
  {
    streak: {
      type: Number,
    },
    highestStreak: {
      type: Number,
    },
    claimedTotal: {
      type: Number,
    },
    claimedDaily: {
      type: Number,
    },
    tokens: {
      type: Number,
    },
  },
  { _id: false }
);

const socialMediaSchema = new Schema(
  {
    HYPIXEL: {
      type: String,
    },
    DISCORD: {
      type: String,
    },
    YOUTUBE: {
      type: String,
    },
    TWITCH: {
      type: String,
    },
    TWITTER: {
      type: String,
    },
    INSTAGRAM: {
      type: String,
    },
    TIKTOK: {
      type: String,
    },
  },
  { _id: false }
);

const statsSchema = new Schema(
  {
    Bedwars: {
      type: Object,
    },
    Skywars: {
      type: Object,
    },
    Duels: {
      type: Object,
    },
    Skyblock: {
      type: Object,
    },
    Arcade: {
      type: Object,
    },
    Arena: {
      type: Object,
    },
    Warlords: {
      type: Object,
    },
    BuildBattle: {
      type: Object,
    },
    TKR: {
      type: Object,
    },
    MurderMystery: {
      type: Object,
    },
    Pit: {
      type: Object,
    },
    TNT: {
      type: Object,
    },
    Blitz: {
      type: Object,
    },
    CvC: {
      type: Object,
    },
    Paintball: {
      type: Object,
    },
    Quake: {
      type: Object,
    },
    SpeedUHC: {
      type: Object,
    },
    Smash: {
      type: Object,
    },
    Walls: {
      type: Object,
    },
    MegaWalls: {
      type: Object,
    },
    VampireZ: {
      type: Object,
    },
    Woolwars: {
      type: Object,
    },
  },
  { _id: false, minimize: false }
);

const historicalPlayerSchema = new Schema({
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
});

export const HypixelHistoricalPlayerModel = client.useDb("Hypixel").model("historicalPlayers", historicalPlayerSchema);
