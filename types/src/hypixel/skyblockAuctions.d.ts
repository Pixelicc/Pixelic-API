export interface HypixelEndedAuction {
  auction_id: string;
  seller: string;
  seller_profile: string;
  buyer: string;
  timestamp: number;
  price: number;
  bin: boolean;
  item_bytes: string;
}

export interface HypixelActiveAuction {
  uuid: string;
  auctioneer: string;
  profile_id: string;
  coop: string[];
  start: number;
  end: number;
  item_name: string;
  item_lore: string;
  extra: string;
  category: string;
  tier: string;
  starting_bid: number;
  item_bytes: string;
  claimed: boolean;
  claimed_bidders: [];
  highest_bid_amount: number;
  last_updated: number;
  bin: boolean;
  bids: { auction_id: string; bidder: string; profile_id: string; amount: number; timestamp: number }[];
  item_uuid?: string;
}
