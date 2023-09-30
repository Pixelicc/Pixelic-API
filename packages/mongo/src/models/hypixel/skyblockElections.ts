import { Schema } from "mongoose";
import { client } from "../../index.js";

const perkSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
  },
  { required: true, _id: false }
);

const candidateSchema = new Schema(
  {
    key: { type: String },
    name: { type: String },
    perks: [perkSchema],
    votes: { type: Number },
  },
  { required: true, _id: false }
);

const electionSchema = new Schema({
  _id: {
    type: Number,
    required: true,
  },
  candidates: [candidateSchema],
  timestamp: {
    type: Number,
    required: true,
  },
});

export const HypixelSkyblockElectionModel = client.useDb("Hypixel").model("skyblockElections", electionSchema);
