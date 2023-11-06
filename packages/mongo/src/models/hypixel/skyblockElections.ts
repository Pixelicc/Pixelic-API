import { Schema } from "mongoose";
import { client } from "../../index.js";

const perkSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const candidateSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    perks: {
      type: [perkSchema],
      required: true,
    },
    votes: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const electionSchema = new Schema({
  _id: {
    type: Number,
    required: true,
  },
  candidates: {
    type: [candidateSchema],
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
});

export const HypixelSkyblockElectionModel = client.useDb("Hypixel").model("skyblockElections", electionSchema);
