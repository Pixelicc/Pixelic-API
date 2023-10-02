import { HypixelSkyblockAuctionTrackingModel, HypixelSkyblockAuctionhouseModel } from "@pixelic/mongo";
import redis from "@pixelic/redis";
import { average, median } from "@pixelic/utils";

export const calculateSkyblockAuctionPrices = async () => {
  const prices: any = {};
  const auctions = await HypixelSkyblockAuctionTrackingModel.find().lean();
  for (const auction of auctions) {
    if (prices[auction.itemID] === undefined) {
      prices[auction.itemID] = [];
    }
    prices[auction.itemID].push(auction.price);
  }

  const parsedPrices = [];

  for (const item of Object.keys(prices)) {
    parsedPrices.push({
      timestamp: new Date(),
      meta: item,
      data: {
        minPrice: Math.min.apply(Math, prices[item]),
        maxPrice: Math.max.apply(Math, prices[item]),
        averagePrice: Math.floor(average(prices[item])),
        medianPrice: median(prices[item]),
      },
    });
  }

  await HypixelSkyblockAuctionhouseModel.insertMany(parsedPrices).catch(() => {});
  await redis.setex("Hypixel:lastSkyblockAuctionhouseIngestion", 3595, "");
};
