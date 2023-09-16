import nbt from "prismarine-nbt";
import util from "util";
// @ts-ignore
import minecraftItems from "minecraft-items";
import { getRatio, formatUUID } from "@pixelic/utils";

const parseNbt = util.promisify(nbt.parse);

const parseRank = (rank: string, packageRank: string | null, newPackageRank: string | null, monthlyPackageRank: string | null, prefix: string) => {
  if (prefix === "§c[OWNER]") {
    return "OWNER";
  }
  if (prefix === "§d[PIG§b+++§d]") {
    /**
     * Technoblade Never Dies
     */
    return "PIG_PLUS_PLUS_PLUS";
  }

  var playerRank = null;

  if (packageRank === "NONE") packageRank = null;
  if (newPackageRank === "NONE") newPackageRank = null;
  if (monthlyPackageRank === "NONE") monthlyPackageRank = null;
  if (rank === "NORMAL") {
    playerRank = monthlyPackageRank || newPackageRank || packageRank || null;
  } else {
    playerRank = rank || monthlyPackageRank || newPackageRank || packageRank || null;
  }

  if (playerRank === "SUPERSTAR") {
    playerRank = "MVP_PLUS_PLUS";
  }
  return playerRank;
};

const parsePlusColor = (plusColor: string, rank: string) => {
  if (plusColor === undefined || plusColor === null) {
    if (rank === "MVP_PLUS" || rank === "MVP_PLUS_PLUS") {
      return "RED";
    } else {
      return null;
    }
  }
  return plusColor;
};

const parsePlusPlusColor = (plusPlusColor: string, rank: string) => {
  if (rank !== "MVP_PLUS_PLUS") {
    return null;
  }
  if (plusPlusColor === undefined || plusPlusColor === null || plusPlusColor === "GOLD") {
    return "GOLD";
  }
  return "AQUA";
};

const formatBedwars = (bedwars: any) => {
  const easyLevels = 4;
  const easyLevelsEXP = 7000;
  const XPPerPrestige = 96 * 5000 + easyLevelsEXP;
  const levelsPerPrestige = 100;
  const highestPrestige = 50;

  const getEXPForLevel = (level: number) => {
    if (level === 0) return 0;
    const respectedLevel = getLevelRespectingPrestige(level);
    if (respectedLevel > easyLevels) return 5000;
    if (respectedLevel === 1) return 1000;
    if (respectedLevel === 2) return 2000;
    if (respectedLevel === 3) return 3500;
    if (respectedLevel === 4) return 500;
    return 5000;
  };

  const getLevelRespectingPrestige = (level: number) => {
    if (level > highestPrestige * levelsPerPrestige) return level - highestPrestige * levelsPerPrestige;
    return level % levelsPerPrestige;
  };

  const getLevelForEXP = (EXP: number) => {
    const prestiges = Math.floor(EXP / XPPerPrestige);
    var level = prestiges * levelsPerPrestige;
    var EXPWithoutPrestiges = EXP - prestiges * XPPerPrestige;
    for (let i = 1; i <= easyLevels; ++i) {
      const EXPForEasyLevel = getEXPForLevel(i);
      if (EXPWithoutPrestiges < EXPForEasyLevel) break;
      level++;
      EXPWithoutPrestiges -= EXPForEasyLevel;
    }
    return level + EXPWithoutPrestiges / 5000;
  };

  const hypixelModes = ["", "eight_one_", "eight_two_", "four_three_", "four_four_", "two_four_", "eight_two_lucky_", "four_four_lucky_", "eight_two_rush_", "four_four_rush_", "eight_two_ultimate_", "four_four_ultimate_", "eight_two_armed_", "four_four_armed_", "eight_two_voidless_", "four_four_voidless_", "castle_"];
  const pixelicModes = ["overall", "solo", "doubles", "threes", "fours", "4v4", "luckyDoubles", "luckyFours", "rushDoubles", "rushFours", "ultimateDoubles", "ultimateFours", "armedDoubles", "armedFours", "voidlessDoubles", "voidlessFours", "castle"];

  const stats: any = {};

  stats["EXP"] = bedwars?.Experience || 0;
  stats["level"] = getLevelForEXP(stats["EXP"]);
  stats["coins"] = bedwars?.coins || 0;
  stats["chests"] = bedwars?.bedwars_boxes || 0;

  stats["quickbuy"] = ["wool", "stone_sword", "chainmail_boots", null, "bow", "speed_ii_potion_(45_seconds)", "tnt", "oak_wood_planks", "iron_sword", "iron_boots", "shears", "arrow", "jump_v_potion_(45_seconds)", "water_bucket", null, null, null, null, null, null, null];
  if (bedwars?.["favourites_2"]) {
    stats["quickbuy"] = bedwars["favourites_2"].toLowerCase().split(",");
    for (const slot in stats["quickbuy"]) {
      if (stats["quickbuy"][slot] === "null") stats["quickbuy"][slot] = null;
    }
  }
  stats["preferedSlots"] = [null, null, null, null, null, null, null, null, null];
  if (bedwars?.["favorite_slots"]) {
    stats["preferedSlots"] = bedwars["favorite_slots"].toLowerCase().split(",");
    for (const slot in stats["preferedSlots"]) {
      if (stats["preferedSlots"][slot] === "null") stats["preferedSlots"][slot] = null;
    }
  }

  for (const mode in hypixelModes) {
    stats[pixelicModes[mode]] = {};
    stats[pixelicModes[mode]]["gamesPlayed"] = bedwars?.[`${hypixelModes[mode]}games_played_bedwars`] || 0;
    stats[pixelicModes[mode]]["winstreak"] = bedwars?.[`${hypixelModes[mode]}winstreak`] || 0;
    stats[pixelicModes[mode]]["wins"] = bedwars?.[`${hypixelModes[mode]}wins_bedwars`] || 0;
    stats[pixelicModes[mode]]["losses"] = bedwars?.[`${hypixelModes[mode]}losses_bedwars`] || 0;
    stats[pixelicModes[mode]]["WLR"] = getRatio(stats[pixelicModes[mode]]["wins"], stats[pixelicModes[mode]]["losses"]);
    stats[pixelicModes[mode]]["finalKills"] = bedwars?.[`${hypixelModes[mode]}final_kills_bedwars`] || 0;
    stats[pixelicModes[mode]]["finalDeaths"] = bedwars?.[`${hypixelModes[mode]}final_deaths_bedwars`] || 0;
    stats[pixelicModes[mode]]["FKDR"] = getRatio(stats[pixelicModes[mode]]["finalKills"], stats[pixelicModes[mode]]["finalDeaths"]);
    stats[pixelicModes[mode]]["kills"] = bedwars?.[`${hypixelModes[mode]}kills_bedwars`] || 0;
    stats[pixelicModes[mode]]["deaths"] = bedwars?.[`${hypixelModes[mode]}deaths_bedwars`] || 0;
    stats[pixelicModes[mode]]["KDR"] = getRatio(stats[pixelicModes[mode]]["kills"], stats[pixelicModes[mode]]["deaths"]);
    stats[pixelicModes[mode]]["bedsBroken"] = bedwars?.[`${hypixelModes[mode]}beds_broken_bedwars`] || 0;
    stats[pixelicModes[mode]]["bedsLost"] = bedwars?.[`${hypixelModes[mode]}beds_lost_bedwars`] || 0;
    stats[pixelicModes[mode]]["BBLR"] = getRatio(stats[pixelicModes[mode]]["bedsBroken"], stats[pixelicModes[mode]]["bedsLost"]);
    stats[pixelicModes[mode]]["resourcesCollected"] = {
      iron: bedwars?.[`${hypixelModes[mode]}iron_resources_collected_bedwars`] || 0,
      gold: bedwars?.[`${hypixelModes[mode]}gold_resources_collected_bedwars`] || 0,
      diamond: bedwars?.[`${hypixelModes[mode]}diamond_resources_collected_bedwars`] || 0,
      emerald: bedwars?.[`${hypixelModes[mode]}emerald_resources_collected_bedwars`] || 0,
    };
  }
  return stats;
};

const formatSkywars = (skywars: any) => {
  const getLevelForEXP = (EXP: number) => {
    const reqs = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];
    if (EXP >= 15000) return (EXP - 15000) / 10000 + 12;
    var level = 0;
    for (var i = 0; i < reqs.length; i++) {
      if (EXP < reqs[i]) {
        level = i + (EXP - reqs[i - 1]) / (reqs[i] - reqs[i - 1]);
        break;
      }
    }
    return level;
  };

  const hypixelModes = ["", "_solo", "_team"];
  const pixelicModes = ["overall", "solo", "doubles"];

  const stats: any = {};

  stats["EXP"] = skywars?.skywars_experience || 0;
  stats["level"] = getLevelForEXP(stats["EXP"]);
  stats["coins"] = skywars?.coins || 0;
  stats["tokens"] = skywars?.cosmetic_tokens || 0;
  stats["souls"] = skywars?.souls || 0;
  stats["chests"] = skywars?.skywars_chests || 0;
  stats["heads"] = {
    total: skywars?.heads || 0,
    eww: skywars?.heads_eww || 0,
    yucky: skywars?.heads_yucky || 0,
    meh: skywars?.heads_meh || 0,
    decent: skywars?.heads_decent || 0,
    salty: skywars?.heads_salty || 0,
    tasty: skywars?.heads_tasty || 0,
    succulent: skywars?.heads_succulent || 0,
    sweet: skywars?.heads_sweet || 0,
    divine: skywars?.heads_divine || 0,
    heavenly: skywars?.heads_heavenly || 0,
  };

  for (const mode in hypixelModes) {
    stats[pixelicModes[mode]] = {};
    stats[pixelicModes[mode]]["timePlayed"] = skywars?.[`time_played${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["wins"] = skywars?.[`wins${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["losses"] = skywars?.[`losses${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["WLR"] = getRatio(stats[pixelicModes[mode]]["wins"], stats[pixelicModes[mode]]["losses"]);
    stats[pixelicModes[mode]]["kills"] = skywars?.[`kills${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["deaths"] = skywars?.[`deaths${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["KDR"] = getRatio(stats[pixelicModes[mode]]["kills"], stats[pixelicModes[mode]]["deaths"]);
    stats[pixelicModes[mode]]["assists"] = skywars?.[`assists${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["arrowsShot"] = skywars?.[`arrows_shot${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["arrowsHit"] = skywars?.[`arrows_hit${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["AHMR"] = getRatio(stats[pixelicModes[mode]]["arrowsHit"], stats[pixelicModes[mode]]["arrowsShot"]);
  }

  stats["overall"]["gamesPlayed"] = skywars?.games_played_skywars || 0;

  return stats;
};

const formatDuels = (duels: any) => {
  const wins = duels?.wins || 0;
  const winstreak = duels?.current_winstreak || 0;
  const losses = duels?.losses || 0;
  const wlr = getRatio(wins, losses);
  const kills = duels?.kills || 0;
  const deaths = duels?.deaths || 0;
  const kdr = getRatio(kills, deaths);
  const gamesPlayed = duels?.games_played_duels || 0;
  const arenaWins = duels?.duel_arena_wins || 0;
  const arenaWinstreak = duels?.current_winstreak_mode_duel_arena || 0;
  const arenaLosses = duels?.duel_arena_losses || 0;
  const arenaWlr = getRatio(arenaWins, arenaLosses);
  const arenaKills = duels?.duel_arena_kills || 0;
  const arenaDeaths = duels?.duel_arena_deaths || 0;
  const arenaKdr = getRatio(arenaKills, arenaDeaths);
  const arenaGamesPlayed = duels?.duel_arena_rounds_played || 0;
  const blitzWins = duels?.blitz_duel_wins || 0;
  const blitzWinstreak = duels?.current_winstreak_mode_blitz_duel || 0;
  const blitzLosses = duels?.blitz_duel_losses || 0;
  const blitzWlr = getRatio(blitzWins, blitzLosses);
  const blitzKills = duels?.blitz_duel_kills || 0;
  const blitzDeaths = duels?.blitz_duel_deaths || 0;
  const blitzKdr = getRatio(blitzKills, blitzDeaths);
  const blitzGamesPlayed = duels?.blitz_duel_rounds_played || 0;
  const bowWins = duels?.bow_duel_wins || 0;
  const bowWinstreak = duels?.current_winstreak_mode_bow_duel || 0;
  const bowLosses = duels?.bow_duel_losses || 0;
  const bowWlr = getRatio(bowWins, bowLosses);
  const bowKills = duels?.bow_duel_kills || 0;
  const bowDeaths = duels?.bow_duel_deaths || 0;
  const bowKdr = getRatio(bowKills, bowDeaths);
  const bowGamesPlayed = duels?.bow_duel_rounds_played || 0;
  const bowspleefWins = duels?.bowspleef_duel_wins || 0;
  const bowspleefWinstreak = duels?.current_winstreak_mode_bowspleef_duel || 0;
  const bowspleefLosses = duels?.bowspleef_duel_losses || 0;
  const bowspleefWlr = getRatio(bowspleefWins, bowspleefLosses);
  const bowspleefKills = duels?.bowspleef_duel_kills || 0;
  const bowspleefDeaths = duels?.bowspleef_duel_deaths || 0;
  const bowspleefKdr = getRatio(bowspleefKills, bowspleefDeaths);
  const bowspleefGamesPlayed = duels?.bowspleef_duel_rounds_played || 0;
  const boxingWins = duels?.boxing_duel_wins || 0;
  const boxingWinstreak = duels?.current_winstreak_mode_boxing_duel || 0;
  const boxingLosses = duels?.boxing_duel_losses || 0;
  const boxingWlr = getRatio(boxingWins, boxingLosses);
  const boxingKills = duels?.boxing_duel_kills || 0;
  const boxingDeaths = duels?.boxing_duel_deaths || 0;
  const boxingKdr = getRatio(boxingKills, boxingDeaths);
  const boxingGamesPlayed = duels?.boxing_duel_rounds_played || 0;
  const bridgeSoloWins = duels?.bridge_duel_wins || 0;
  const bridgeSoloWinstreak = duels?.current_winstreak_mode_bridge_duel || 0;
  const bridgeSoloLosses = duels?.bridge_duel_losses || 0;
  const bridgeSoloWlr = getRatio(bridgeSoloWins, bridgeSoloLosses);
  const bridgeSoloKills = duels?.bridge_duel_bridge_kills || 0;
  const bridgeSoloDeaths = duels?.bridge_duel_bridge_deaths || 0;
  const bridgeSoloKdr = getRatio(bridgeSoloKills, bridgeSoloDeaths);
  const bridgeSoloGamesPlayed = duels?.bridge_duel_rounds_played || 0;
  const bridgeDoublesWins = duels?.bridge_doubles_wins || 0;
  const bridgeDoublesWinstreak = duels?.current_winstreak_mode_bridge_doubles || 0;
  const bridgeDoublesLosses = duels?.bridge_doubles_losses || 0;
  const birdgeDoublesWlr = getRatio(bridgeDoublesWins, bridgeDoublesLosses);
  const bridgeDoublesKills = duels?.bridge_doubles_kills || 0;
  const bridgeDoublesDeaths = duels?.bridge_doubles_deaths || 0;
  const bridgeDoublesKdr = getRatio(bridgeDoublesKills, bridgeDoublesDeaths);
  const bridgeDoublesGamesPlayed = duels?.bridge_doubles_rounds_played || 0;
  const bridgeThreesWins = duels?.bridge_threes_wins || 0;
  const bridgeThreesWinstreak = duels?.current_winstreak_mode_bridge_threes || 0;
  const bridgeThreesLosses = duels?.bridge_threes_losses || 0;
  const bridgeThreesWlr = getRatio(bridgeThreesWins, bridgeThreesLosses);
  const bridgeThreesKills = duels?.bridge_threes_kills || 0;
  const bridgeThreesDeaths = duels?.bridge_threes_deaths || 0;
  const bridgeThreesKdr = getRatio(bridgeThreesKills, bridgeThreesDeaths);
  const bridgeThreesGamesPlayed = duels?.bridge_threes_rounds_played || 0;
  const bridgeFoursWins = duels?.bridge_four_wins || 0;
  const bridgeFoursWinstreak = duels?.current_winstreak_mode_bridge_threes || 0;
  const bridgeFoursLosses = duels?.bridge_four_losses || 0;
  const bridgeFoursWlr = getRatio(bridgeFoursWins, bridgeFoursLosses);
  const bridgeFoursKills = duels?.bridge_four_kills || 0;
  const bridgeFoursDeaths = duels?.bridge_four_deaths || 0;
  const bridgeFoursKdr = getRatio(bridgeFoursKills, bridgeFoursDeaths);
  const bridgeFoursGamesPlayed = duels?.bridge_four_rounds_played || 0;
  const bridgeQuadDoublesWins = duels?.bridge_2v2v2v2_wins || 0;
  const bridgeQuadDoublesWinstreak = duels?.current_winstreak_mode_bridge_2v2v2v2 || 0;
  const bridgeQuadDoublesLosses = duels?.bridge_2v2v2v2_losses || 0;
  const bridgeQuadDoublesWlr = getRatio(bridgeQuadDoublesWins, bridgeQuadDoublesLosses);
  const bridgeQuadDoublesKills = duels?.bridge_2v2v2v2_bridge_kills || 0;
  const bridgeQuadDoublesDeaths = duels?.bridge_2v2v2v2_bridge_deaths || 0;
  const bridgeQuadDoublesKdr = getRatio(bridgeQuadDoublesKills, bridgeQuadDoublesDeaths);
  const bridgeQuadDoublesGamesPlayed = duels?.bridge_2v2v2v2_rounds_played || 0;
  const bridgeQuadThreesWins = duels?.bridge_3v3v3v3_wins || 0;
  const bridgeQuadThreesWinstreak = duels?.current_winstreak_mode_bridge_3v3v3v3 || 0;
  const bridgeQuadThreesLosses = duels?.bridge_3v3v3v3_losses || 0;
  const bridgeQuadThreesWlr = getRatio(bridgeQuadThreesWins, bridgeQuadThreesLosses);
  const bridgeQuadThreesKills = duels?.bridge_3v3v3v3_bridge_kills || 0;
  const bridgeQuadThreesDeaths = duels?.bridge_3v3v3v3_bridge_deaths || 0;
  const bridgeQuadThreesKdr = getRatio(bridgeQuadThreesKills, bridgeQuadThreesDeaths);
  const bridgeQuadThreesGamesPlayed = duels?.bridge_3v3v3v3_rounds_played || 0;
  const bridgeCTFWins = duels?.capture_threes_wins || 0;
  const bridgeCTFWinstreak = duels?.current_winstreak_mode_capture_threes || 0;
  const bridgeCTFLosses = duels?.capture_threes_losses || 0;
  const bridgeCTFWlr = getRatio(bridgeCTFWins, bridgeCTFLosses);
  const bridgeCTFKills = duels?.capture_threes_bridge_kills || 0;
  const bridgeCTFDeaths = duels?.capture_threes_bridge_deaths || 0;
  const bridgeCTFKdr = getRatio(bridgeCTFKills, bridgeCTFDeaths);
  const bridgeCTFGamesPlayed = duels?.capture_threes_rounds_played || 0;
  const bridgeWins = bridgeSoloWins + bridgeDoublesWins + bridgeThreesWins + bridgeFoursWins + bridgeQuadDoublesWins + bridgeQuadThreesWins + bridgeCTFWins;
  const bridgeWinstreak = duels?.current_winstreak_mode_bridge_duel || 0;
  const bridgeLosses = bridgeSoloLosses + bridgeDoublesLosses + bridgeThreesLosses + bridgeFoursLosses + bridgeQuadDoublesLosses + bridgeQuadThreesLosses + bridgeCTFLosses;
  const bridgeWlr = getRatio(bridgeWins, bridgeLosses);
  const bridgeKills = bridgeSoloKills + bridgeDoublesKills + bridgeThreesKills + bridgeFoursKills + bridgeQuadDoublesKills + bridgeQuadThreesKills + bridgeCTFKills;
  const bridgeDeaths = bridgeSoloDeaths + bridgeDoublesDeaths + bridgeThreesDeaths + bridgeFoursDeaths + bridgeQuadDoublesDeaths + bridgeQuadThreesDeaths + bridgeCTFDeaths;
  const bridgeKdr = getRatio(bridgeKills, bridgeLosses);
  const bridgeGamesPlayed = bridgeSoloGamesPlayed + bridgeDoublesGamesPlayed + bridgeThreesGamesPlayed + bridgeFoursGamesPlayed + bridgeQuadDoublesGamesPlayed + bridgeQuadThreesGamesPlayed + bridgeCTFGamesPlayed;
  const classicWins = duels?.classic_duel_wins || 0;
  const classicWinstreak = duels?.current_winstreak_mode_classic_duel || 0;
  const classicLosses = duels?.classic_duel_losses || 0;
  const classicWlr = getRatio(classicWins, classicLosses);
  const classicKills = duels?.classic_duel_kills || 0;
  const classicDeaths = duels?.classic_duel_deaths || 0;
  const classicKdr = getRatio(classicKills, classicDeaths);
  const classicGamesPlayed = duels?.classic_duel_rounds_played || 0;
  const comboWins = duels?.combo_duel_wins || 0;
  const comboWinstreak = duels?.current_winstreak_mode_combo_duel || 0;
  const comboLosses = duels?.combo_duel_losses || 0;
  const comboWlr = getRatio(comboWins, comboLosses);
  const comboKills = duels?.combo_duel_kills || 0;
  const comboDeaths = duels?.combo_duel_deaths || 0;
  const comboKdr = getRatio(comboKills, comboDeaths);
  const comboGamesPlayed = duels?.combo_duel_rounds_played || 0;
  const MWSoloWins = duels?.mw_duel_wins || 0;
  const MWSoloWinstreak = duels?.current_winstreak_mode_mw_duel || 0;
  const MWSoloLosses = duels?.mw_duel_losses || 0;
  const MWSoloWlr = getRatio(MWSoloWins, MWSoloLosses);
  const MWSoloKills = duels?.mw_duel_kills || 0;
  const MWSoloDeaths = duels?.mw_duel_deaths || 0;
  const MWSoloKdr = getRatio(MWSoloKills, MWSoloDeaths);
  const MWSoloGamesPlayed = duels?.mw_duel_rounds_played || 0;
  const MWDoublesWins = duels?.mw_doubles_wins || 0;
  const MWDoublesWinstreak = duels?.current_winstreak_mode_mw_doubles || 0;
  const MWDoublesLosses = duels?.mw_doubles_losses || 0;
  const MWDoublesWlr = getRatio(MWDoublesWins, MWDoublesLosses);
  const MWDoublesKills = duels?.mw_doubles_kills || 0;
  const MWDoublesDeaths = duels?.mw_doubles_deaths || 0;
  const MWDoublesKdr = getRatio(MWDoublesKills, MWDoublesDeaths);
  const MWDoublesGamesPlayed = duels?.mw_doubles_rounds_played || 0;
  const MWWins = MWSoloWins + MWDoublesWins;
  const MWWinstreak = duels?.current_mega_walls_winstreak || 0;
  const MWLosses = MWSoloLosses + MWDoublesLosses;
  const MWWlr = getRatio(MWWins, MWLosses);
  const MWKills = MWSoloKills + MWDoublesKills;
  const MWDeaths = MWSoloDeaths + MWDoublesDeaths;
  const MWKdr = getRatio(MWKills, MWDeaths);
  const MWGamesPlayed = MWSoloGamesPlayed + MWDoublesGamesPlayed;
  const no_debuffWins = duels?.potion_duel_wins || 0;
  const no_debuffWinstreak = duels?.current_winstreak_mode_potion_duel || 0;
  const no_debuffLosses = duels?.potion_duel_losses || 0;
  const no_debuffWlr = getRatio(no_debuffWins, no_debuffLosses);
  const no_debuffKills = duels?.potion_duel_kills || 0;
  const no_debuffDeaths = duels?.potion_duel_deaths || 0;
  const no_debuffKdr = getRatio(no_debuffKills, no_debuffDeaths);
  const no_debuffGamesPlayed = duels?.potion_duel_rounds_played || 0;
  const OPSoloWins = duels?.op_duel_wins || 0;
  const OPSoloWinstreak = duels?.current_winstreak_mode_op_duel || 0;
  const OPSoloLosses = duels?.op_duel_losses || 0;
  const OPSoloWlr = getRatio(OPSoloWins, OPSoloLosses);
  const OPSoloKills = duels?.op_duel_kills || 0;
  const OPSoloDeaths = duels?.op_duel_deaths || 0;
  const OPSoloKdr = getRatio(OPSoloKills, OPSoloDeaths);
  const OPSoloGamesPlayed = duels?.op_duel_rounds_played || 0;
  const OPDoublesWins = duels?.op_doubles_wins || 0;
  const OPDoublesWinstreak = duels?.current_winstreak_mode_op_doubles || 0;
  const OPDoublesLosses = duels?.op_doubles_losses || 0;
  const OPDoublesWlr = getRatio(OPDoublesWins, OPDoublesLosses);
  const OPDoublesKills = duels?.op_doubles_kills || 0;
  const OPDoublesDeaths = duels?.op_doubles_deaths || 0;
  const OPDoublesKdr = getRatio(OPDoublesKills, OPDoublesDeaths);
  const OPDoublesGamesPlayed = duels?.op_doubles_rounds_played || 0;
  const OPWins = OPSoloWins + OPDoublesWins;
  const OPWinstreak = duels?.current_op_winstreak || 0;
  const OPLosses = OPSoloLosses + OPDoublesLosses;
  const OPWlr = getRatio(OPWins, OPLosses);
  const OPKills = OPSoloKills + OPDoublesKills;
  const OPDeaths = OPSoloDeaths + OPDoublesDeaths;
  const OPKdr = getRatio(OPKills, OPLosses);
  const OPGamesPlayed = OPSoloGamesPlayed + OPDoublesGamesPlayed;
  const parkourWins = duels?.parkour_eight_wins || 0;
  const parkourWinstreak = duels?.urrent_winstreak_mode_parkour_eight || 0;
  const parkourLosses = duels?.parkour_eight_losses || 0;
  const parkourWlr = getRatio(parkourWins, parkourLosses);
  const parkourGamesPlayed = duels?.parkour_eight_rounds_played || 0;
  const SkywarsSoloWins = duels?.sw_duel_wins || 0;
  const SkywarsSoloWinstreak = duels?.current_winstreak_mode_sw_duel || 0;
  const SkywarsSoloLosses = duels?.sw_duel_losses || 0;
  const SkywarsSoloWlr = getRatio(SkywarsSoloWins, SkywarsSoloLosses);
  const SkywarsSoloKills = duels?.sw_duel_kills || 0;
  const SkywarsSoloDeaths = duels?.sw_duel_deaths || 0;
  const SkywarsSoloKdr = getRatio(SkywarsSoloKills, SkywarsSoloDeaths);
  const SkywarsSoloGamesPlayed = duels?.sw_duel_rounds_played || 0;
  const SkywarsDoublesWins = duels?.sw_doubles_wins || 0;
  const SkywarsDoublesWinstreak = duels?.current_winstreak_mode_sw_doubles || 0;
  const SkywarsDoublesLosses = duels?.sw_doubles_losses || 0;
  const SkywarsDoublesWlr = getRatio(SkywarsDoublesWins, SkywarsDoublesLosses);
  const SkywarsDoublesKills = duels?.sw_doubles_kills || 0;
  const SkywarsDoublesDeaths = duels?.sw_doubles_deaths || 0;
  const SkywarsDoublesKdr = getRatio(SkywarsDoublesKills, SkywarsDoublesDeaths);
  const SkywarsDoublesGamesPlayed = duels?.sw_doubles_rounds_played || 0;
  const SkywarsWins = SkywarsSoloWins + SkywarsDoublesWins;
  const SkywarsWinstreak = duels?.current_op_winstreak || 0;
  const SkywarsLosses = SkywarsSoloLosses + SkywarsDoublesLosses;
  const SkywarsWlr = getRatio(SkywarsWins, SkywarsLosses);
  const SkywarsKills = SkywarsSoloKills + SkywarsDoublesKills;
  const SkywarsDeaths = SkywarsSoloDeaths + SkywarsDoublesDeaths;
  const SkywarsKdr = getRatio(SkywarsKills, SkywarsDeaths);
  const SkywarsGamesPlayed = SkywarsSoloGamesPlayed + SkywarsDoublesGamesPlayed;
  const sumoWins = duels?.sumo_duel_wins || 0;
  const sumoWinstreak = duels?.current_winstreak_mode_sumo_duel || 0;
  const sumoLosses = duels?.sumo_duel_losses || 0;
  const sumoWlr = getRatio(sumoWins, sumoLosses);
  const sumoKills = duels?.sumo_duel_kills || 0;
  const sumoDeaths = duels?.sumo_duel_deaths || 0;
  const sumoKdr = getRatio(sumoKills, sumoDeaths);
  const sumoGamesPlayed = duels?.sumo_duel_rounds_played || 0;
  const uhcSoloWins = duels?.uhc_duel_wins || 0;
  const uhcSoloWinstreak = duels?.current_winstreak_mode_uhc_duel || 0;
  const uhcSoloLosses = duels?.uhc_duel_losses || 0;
  const uhcSoloWlr = getRatio(uhcSoloWins, uhcSoloLosses);
  const uhcSoloKills = duels?.uhc_duel_kills || 0;
  const uhcSoloDeaths = duels?.uhc_duel_deaths || 0;
  const uhcSoloKdr = getRatio(uhcSoloKills, uhcSoloDeaths);
  const uhcSoloGamesPlayed = duels?.uhc_duel_rounds_played || 0;
  const uhcDoublesWins = duels?.uhc_doubles_wins || 0;
  const uhcDoublesWinstreak = duels?.current_winstreak_mode_uhc_doubles || 0;
  const uhcDoublesLosses = duels?.uhc_doubles_losses || 0;
  const uhcDoublesWlr = getRatio(uhcDoublesWins, uhcDoublesLosses);
  const uhcDoublesKills = duels?.uhc_doubles_kills || 0;
  const uhcDoublesDeaths = duels?.uhc_doubles_deaths || 0;
  const uhcDoublesKdr = getRatio(uhcDoublesKills, uhcDoublesDeaths);
  const uhcDoublesGamesPlayed = duels?.uhc_doubles_rounds_played || 0;
  const uhcFoursWins = duels?.uhc_four_wins || 0;
  const uhcFoursWinstreak = duels?.current_winstreak_mode_uhc_four || 0;
  const uhcFoursLosses = duels?.uhc_four_losses || 0;
  const uhcFoursWlr = getRatio(uhcFoursWins, uhcFoursLosses);
  const uhcFoursKills = duels?.uhc_four_kills || 0;
  const uhcFoursDeaths = duels?.uhc_four_deaths || 0;
  const uhcFoursKdr = getRatio(uhcFoursKills, uhcFoursDeaths);
  const uhcFoursGamesPlayed = duels?.uhc_four_rounds_played || 0;
  const uhcDeathmatchWins = duels?.uhc_meetup_wins || 0;
  const uhcDeathmatchWinstreak = duels?.current_winstreak_mode_uhc_meetup || 0;
  const uhcDeathmatchLosses = duels?.uhc_meetup_losses || 0;
  const uhcDeathmatchWlr = getRatio(uhcDeathmatchWins, uhcDeathmatchLosses);
  const uhcDeathmatchKills = duels?.uhc_meetup_kills || 0;
  const uhcDeathmatchDeaths = duels?.uhc_meetup_deaths || 0;
  const uhcDeathmatchKdr = getRatio(uhcDeathmatchKills, uhcDeathmatchDeaths);
  const uhcDeathmatchGamesPlayed = duels?.uhc_meetup_rounds_played || 0;
  const uhcWins = uhcSoloWins + uhcDoublesWins + uhcDeathmatchWins + uhcFoursWins;
  const uhcWinstreak = duels?.current_winstreak_mode_uhc_duel || 0;
  const uhcLosses = uhcSoloLosses + uhcDoublesLosses + uhcDeathmatchLosses + uhcFoursLosses;
  const uhcWlr = getRatio(uhcWins, uhcLosses);
  const uhcKills = uhcSoloKills + uhcDoublesKills + uhcDeathmatchKills + uhcFoursKills;
  const uhcDeaths = uhcSoloDeaths + uhcDoublesDeaths + uhcDeathmatchDeaths + uhcFoursDeaths;
  const uhcKdr = getRatio(uhcKills, uhcDeaths);
  const uhcGamesPlayed = uhcSoloGamesPlayed + uhcDoublesGamesPlayed + uhcDeathmatchGamesPlayed + uhcFoursGamesPlayed;

  return {
    coins: duels?.coins || 0,
    chests: duels?.duels_chests || 0,
    activeTitle: duels?.active_cosmetictitle || null,
    overall: {
      gamesPlayed: gamesPlayed,
      winstreak: winstreak,
      wins: wins,
      losses: losses,
      WLR: wlr,
      kills: kills,
      deaths: deaths,
      KDR: kdr,
    },
    arena: {
      gamesPlayed: arenaGamesPlayed,
      winstreak: arenaWinstreak,
      wins: arenaWins,
      losses: arenaLosses,
      WLR: arenaWlr,
      kills: arenaKills,
      deaths: arenaDeaths,
      KDR: arenaKdr,
    },
    blitz: {
      gamesPlayed: blitzGamesPlayed,
      winstreak: blitzWinstreak,
      wins: blitzWins,
      losses: blitzLosses,
      WLR: blitzWlr,
      kills: blitzKills,
      deaths: blitzDeaths,
      KDR: blitzKdr,
    },
    bow: {
      gamesPlayed: bowGamesPlayed,
      winstreak: bowWinstreak,
      wins: bowWins,
      losses: bowLosses,
      WLR: bowWlr,
      kills: bowKills,
      deaths: bowDeaths,
      KDR: bowKdr,
    },
    bowspleef: {
      gamesPlayed: bowspleefGamesPlayed,
      winstreak: bowspleefWinstreak,
      wins: bowspleefWins,
      losses: bowspleefLosses,
      WLR: bowspleefWlr,
      kills: bowspleefKills,
      deaths: bowspleefDeaths,
      KDR: bowspleefKdr,
    },
    boxing: {
      gamesPlayed: boxingGamesPlayed,
      winstreak: boxingWinstreak,
      wins: boxingWins,
      losses: boxingLosses,
      WLR: boxingWlr,
      kills: boxingKills,
      deaths: boxingDeaths,
      KDR: boxingKdr,
    },
    bridge: {
      overall: {
        gamesPlayed: bridgeGamesPlayed,
        winstreak: bridgeWinstreak,
        wins: bridgeWins,
        losses: bridgeLosses,
        WLR: bridgeWlr,
        kills: bridgeKills,
        deaths: bridgeDeaths,
        KDR: bridgeKdr,
      },
      solo: {
        gamesPlayed: bridgeSoloGamesPlayed,
        winstreak: bridgeSoloWinstreak,
        wins: bridgeSoloWins,
        losses: bridgeSoloLosses,
        WLR: bridgeSoloWlr,
        kills: bridgeSoloKills,
        deaths: bridgeSoloDeaths,
        KDR: bridgeSoloKdr,
      },
      doubles: {
        gamesPlayed: bridgeDoublesGamesPlayed,
        winstreak: bridgeDoublesWinstreak,
        wins: bridgeDoublesWins,
        losses: bridgeDoublesLosses,
        WLR: birdgeDoublesWlr,
        kills: bridgeDoublesKills,
        deaths: bridgeDoublesDeaths,
        KDR: bridgeDoublesKdr,
      },
      threes: {
        gamesPlayed: bridgeThreesGamesPlayed,
        winstreak: bridgeThreesWinstreak,
        wins: bridgeThreesWins,
        losses: bridgeThreesLosses,
        WLR: bridgeThreesWlr,
        kills: bridgeThreesKills,
        deaths: bridgeThreesDeaths,
        KDR: bridgeThreesKdr,
      },
      fours: {
        gamesPlayed: bridgeFoursGamesPlayed,
        winstreak: bridgeFoursWinstreak,
        wins: bridgeFoursWins,
        losses: bridgeFoursLosses,
        WLR: bridgeFoursWlr,
        kills: bridgeFoursKills,
        deaths: bridgeFoursDeaths,
        KDR: bridgeFoursKdr,
      },
      ["2v2v2v2"]: {
        gamesPlayed: bridgeQuadDoublesGamesPlayed,
        winstreak: bridgeQuadDoublesWinstreak,
        wins: bridgeQuadDoublesWins,
        losses: bridgeQuadDoublesLosses,
        WLR: bridgeQuadDoublesWlr,
        kills: bridgeQuadDoublesKills,
        deaths: bridgeQuadDoublesDeaths,
        KDR: bridgeQuadDoublesKdr,
      },
      ["3v3v3v3"]: {
        gamesPlayed: bridgeQuadThreesGamesPlayed,
        winstreak: bridgeQuadThreesWinstreak,
        wins: bridgeQuadThreesWins,
        losses: bridgeQuadThreesLosses,
        WLR: bridgeQuadThreesWlr,
        kills: bridgeQuadThreesKills,
        deaths: bridgeQuadThreesDeaths,
        KDR: bridgeQuadThreesKdr,
      },
      CTF: {
        gamesPlayed: bridgeCTFGamesPlayed,
        winstreak: bridgeCTFWinstreak,
        wins: bridgeCTFWins,
        losses: bridgeCTFLosses,
        WLR: bridgeCTFWlr,
        kills: bridgeCTFKills,
        deaths: bridgeCTFDeaths,
        KDR: bridgeCTFKdr,
      },
    },
    classic: {
      gamesPlayed: classicGamesPlayed,
      winstreak: classicWinstreak,
      wins: classicWins,
      losses: classicLosses,
      WLR: classicWlr,
      kills: classicKills,
      deaths: classicDeaths,
      KDR: classicKdr,
    },
    combo: {
      gamesPlayed: comboGamesPlayed,
      winstreak: comboWinstreak,
      wins: comboWins,
      losses: comboLosses,
      WLR: comboWlr,
      kills: comboKills,
      deaths: comboDeaths,
      KDR: comboKdr,
    },
    megawalls: {
      overall: {
        gamesPlayed: MWGamesPlayed,
        winstreak: MWWinstreak,
        wins: MWWins,
        losses: MWLosses,
        WLR: MWWlr,
        kills: MWKills,
        deaths: MWDeaths,
        KDR: MWKdr,
      },
      solo: {
        gamesPlayed: MWSoloGamesPlayed,
        winstreak: MWSoloWinstreak,
        wins: MWSoloWins,
        losses: MWSoloLosses,
        WLR: MWSoloWlr,
        kills: MWSoloKills,
        deaths: MWSoloDeaths,
        KDR: MWSoloKdr,
      },
      doubles: {
        gamesPlayed: MWDoublesGamesPlayed,
        winstreak: MWDoublesWinstreak,
        wins: MWDoublesWins,
        losses: MWDoublesLosses,
        WLR: MWDoublesWlr,
        kills: MWDoublesKills,
        deaths: MWDoublesDeaths,
        KDR: MWDoublesKdr,
      },
    },
    noDebuff: {
      gamesPlayed: no_debuffGamesPlayed,
      winstreak: no_debuffWinstreak,
      wins: no_debuffWins,
      losses: no_debuffLosses,
      WLR: no_debuffWlr,
      kills: no_debuffKills,
      deaths: no_debuffDeaths,
      KDR: no_debuffKdr,
    },
    op: {
      overall: {
        gamesPlayed: OPGamesPlayed,
        winstreak: OPWinstreak,
        wins: OPWins,
        losses: OPLosses,
        WLR: OPWlr,
        kills: OPKills,
        deaths: OPDeaths,
        KDR: OPKdr,
      },
      solo: {
        gamesPlayed: OPSoloGamesPlayed,
        winstreak: OPSoloWinstreak,
        wins: OPSoloWins,
        losses: OPSoloLosses,
        WLR: OPSoloWlr,
        kills: OPSoloKills,
        deaths: OPSoloDeaths,
        KDR: OPSoloKdr,
      },
      doubles: {
        gamesPlayed: OPDoublesGamesPlayed,
        winstreak: OPDoublesWinstreak,
        wins: OPDoublesWins,
        losses: OPDoublesLosses,
        WLR: OPDoublesWlr,
        kills: OPDoublesKills,
        deaths: OPDoublesDeaths,
        KDR: OPDoublesKdr,
      },
    },
    parkour: {
      gamesPlayed: parkourGamesPlayed,
      winstreak: parkourWinstreak,
      wins: parkourWins,
      losses: parkourLosses,
      WLR: parkourWlr,
    },
    skywars: {
      overall: {
        gamesPlayed: SkywarsGamesPlayed,
        winstreak: SkywarsWinstreak,
        wins: SkywarsWins,
        losses: SkywarsLosses,
        WLR: SkywarsWlr,
        kills: SkywarsKills,
        deaths: SkywarsDeaths,
        KDR: SkywarsKdr,
      },
      solo: {
        gamesPlayed: SkywarsSoloGamesPlayed,
        winstreak: SkywarsSoloWinstreak,
        wins: SkywarsSoloWins,
        losses: SkywarsSoloLosses,
        WLR: SkywarsSoloWlr,
        kills: SkywarsSoloKills,
        deaths: SkywarsSoloDeaths,
        KDR: SkywarsSoloKdr,
      },
      doubles: {
        gamesPlayed: SkywarsDoublesGamesPlayed,
        winstreak: SkywarsDoublesWinstreak,
        wins: SkywarsDoublesWins,
        losses: SkywarsDoublesLosses,
        WLR: SkywarsDoublesWlr,
        kills: SkywarsDoublesKills,
        deaths: SkywarsDoublesDeaths,
        KDR: SkywarsDoublesKdr,
      },
    },
    sumo: {
      gamesPlayed: sumoGamesPlayed,
      winstreak: sumoWinstreak,
      wins: sumoWins,
      losses: sumoLosses,
      WLR: sumoWlr,
      kills: sumoKills,
      deaths: sumoDeaths,
      KDR: sumoKdr,
    },
    uhc: {
      overall: {
        gamesPlayed: uhcGamesPlayed,
        winstreak: uhcWinstreak,
        wins: uhcWins,
        losses: uhcLosses,
        WLR: uhcWlr,
        kills: uhcKills,
        deaths: uhcDeaths,
        KDR: uhcKdr,
      },
      solo: {
        gamesPlayed: uhcSoloGamesPlayed,
        winstreak: uhcSoloWinstreak,
        wins: uhcSoloWins,
        losses: uhcSoloLosses,
        WLR: uhcSoloWlr,
        kills: uhcSoloKills,
        deaths: uhcSoloDeaths,
        KDR: uhcSoloKdr,
      },
      doubles: {
        gamesPlayed: uhcDoublesGamesPlayed,
        winstreak: uhcDoublesWinstreak,
        wins: uhcDoublesWins,
        losses: uhcDoublesLosses,
        WLR: uhcDoublesWlr,
        kills: uhcDoublesKills,
        deaths: uhcDoublesDeaths,
        KDR: uhcDoublesKdr,
      },
      fours: {
        gamesPlayed: uhcFoursGamesPlayed,
        winstreak: uhcFoursWinstreak,
        wins: uhcFoursWins,
        losses: uhcFoursLosses,
        WLR: uhcFoursWlr,
        kills: uhcFoursKills,
        deaths: uhcFoursDeaths,
        KDR: uhcFoursKdr,
      },
      deathmatch: {
        gamesPlayed: uhcDeathmatchGamesPlayed,
        winstreak: uhcDeathmatchWinstreak,
        wins: uhcDeathmatchWins,
        losses: uhcDeathmatchLosses,
        WLR: uhcDeathmatchWlr,
        kills: uhcDeathmatchKills,
        deaths: uhcDeathmatchDeaths,
        KDR: uhcDeathmatchKdr,
      },
    },
  };
};

const formatSkyblock = (skyblock: any) => {
  const profiles = [];
  for (const profile of Object.keys(skyblock?.profiles || {})) {
    profiles.push({ ID: formatUUID(skyblock.profiles[profile]["profile_id"]), cuteName: skyblock.profiles[profile]["cute_name"] });
  }
  return { profiles: profiles };
};

const formatArcade = (arcade: any) => {
  return {
    coins: arcade?.coins || 0,
    blockingDead: {
      wins: arcade?.wins_dayone || 0,
      zombieKills: arcade?.kills_dayone || 0,
      headshots: arcade?.headshots_dayone || 0,
      currentWeapon: arcade?.melee_weapon || null,
    },
    dragonWars: {
      wins: arcade?.wins_dragonwars2 || 0,
      kills: arcade?.kills_dragonwars2 || 0,
    },
    galaxyWars: {
      wins: arcade?.sw_game_wins || 0,
      kills: arcade?.sw_kills || 0,
      deaths: arcade?.sw_deaths || 0,
      rebelKills: arcade?.sw_rebel_kills || 0,
      empireKills: arcade?.sw_empire_kills || 0,
      shotsFired: arcade?.sw_shots_fired || 0,
    },
    enderSpleef: {
      wins: arcade?.wins_ender || 0,
      blocksBroken: arcade?.blocks_destroyed_ender || 0,
      powerupActiviations: arcade?.powerup_activations_ender || 0,
      bigShotActiviations: arcade?.bigshot_powerup_activations_ender || 0,
      tripleShotActiviations: arcade?.tripleshot_powerup_activations_ender || 0,
    },
    hypixelSays: {
      wins: arcade?.wins_simon_says || 0,
      roundsPlayed: arcade?.rounds_simon_says || 0,
      roundsWon: arcade?.round_wins_simon_says || 0,
      highScore: arcade?.top_score_simon_says || 0,
    },
    santaSays: {
      wins: arcade?.wins_santa_says || 0,
      roundsPlayed: arcade?.rounds_santa_says || 0,
      roundsWon: arcade?.round_wins_santa_says || 0,
      highScore: arcade?.top_score_santa_says || 0,
    },
    miniwalls: {
      wins: arcade?.wins_mini_walls || 0,
      finalKills: arcade?.final_kills_mini_walls || 0,
      kills: arcade?.kills_mini_walls || 0,
      deaths: arcade?.deaths_mini_walls || 0,
      arrowsShot: arcade?.arrows_shot_mini_walls || 0,
      arrowsHit: arcade?.arrows_hit_mini_walls || 0,
      witherDamage: arcade?.wither_damage_mini_walls || 0,
      witherKills: arcade?.wither_kills_mini_walls || 0,
      activeKit: arcade?.miniwalls_activeKit || null,
    },
    partyGames: {
      wins: (arcade?.wins_party || 0) + (arcade?.wins_party_2 || 0) + (arcade?.wins_party_3 || 0),
      wins1: arcade?.wins_party || 0,
      wins2: arcade?.wins_party_2 || 0,
      wins3: arcade?.wins_party_3 || 0,
      roundsWon: arcade?.round_wins_party || 0,
      starsEarned: arcade?.total_stars_party || 0,
      lawnMoowerWins: arcade?.lawn_moower_round_wins_party || 0,
      lawnMoowerTotalScore: arcade?.lawn_moower_mowed_total_score_party || 0,
      lawnMoowerHighScore: arcade?.lawn_moower_mowed_best_score_party || 0,
      animalSlaughterWins: arcade?.animal_slaughter_round_wins_party || 0,
      animalSlaughterKills: arcade?.animal_slaughter_kills_party || 0,
      animalSlaughterHighScore: arcade?.animal_slaughter_best_score_party || 0,
      chickenRingsWins: arcade?.chicken_rings_round_wins_party || 0,
      chickenRingsBestTime: arcade?.chicken_rings_best_time_party || 0,
      RPG16Wins: arcade?.rpg_16_round_wins_party || 0,
      RPG16TotalScore: arcade?.rpg_16_kills_party || 0,
      RPG16HighScore: arcade?.rpg_16_kills_best_score_party || 0,
      anvilSpleefWins: arcade?.anvil_spleef_round_wins_party || 0,
      anvilSpleefBestTime: arcade?.anvil_spleef_best_time_party || 0,
      bombardmentWins: arcade?.bombardment_round_wins_party || 0,
      bombardmentBestTime: arcade?.bombardment_best_time_party || 0,
      diveWins: arcade?.dive_round_wins_party || 0,
      diveTotalScore: arcade?.dive_total_score_party || 0,
      diveHighScore: arcade?.dive_best_score_party || 0,
      highGroundWins: arcade?.high_ground_round_wins_party || 0,
      highGroundTotalScore: arcade?.high_ground_total_score_party || 0,
      highGroundHighScore: arcade?.high_ground_best_score_party || 0,
      hoeHoeHoeWins: arcade?.hoe_hoe_hoe_round_wins_party || 0,
      hoeHoeHoeTotalScore: arcade?.hoe_hoe_hoe_total_score_party || 0,
      hoeHoeHoeHighScore: arcade?.hoe_hoe_hoe_best_score_party || 0,
      jigsawRushWins: arcade?.jigsaw_rush_round_wins_party || 0,
      jigsawRushBestime: arcade?.jigsaw_rush_best_time_party || 0,
      jungleJumpWins: arcade?.jungle_jump_round_wins_party || 0,
      jungleJumpBestTime: arcade?.jungle_jump_best_time_party || 0,
      labEscapeWins: arcade?.lab_escape_round_wins_party || 0,
      labEscapeBestTime: arcade?.lab_escape_best_time_party || 0,
      minecartRacingWins: arcade?.minecart_racing_round_wins_party || 0,
      minecartRacingBestTime: arcade?.minecart_racing_best_time_party || 0,
      spiderMazeWins: arcade?.spider_maze_round_wins_party || 0,
      spiderMazeBestTime: arcade?.spider_maze_best_time_party || 0,
      theFloorIsLavaWins: arcade?.the_floor_is_lava_round_wins_party || 0,
      theFloorIsLavaBestTime: arcade?.the_floor_is_lava_best_time_party || 0,
      avalancheWins: arcade?.avalanche_round_wins_party || 0,
      volcanoWins: arcade?.volcano_round_wins_party || 0,
      pigFishingWins: arcade?.pig_fishing_round_wins_party || 0,
      pigJoustingWins: arcade?.pig_jousting_round_wins_party || 0,
      trampolinioWins: arcade?.trampolinio_round_wins_party || 0,
      workshopWins: arcade?.workshop_round_wins_party || 0,
      shootingRangeWins: arcade?.shooting_range_round_wins_party || 0,
      frozenFloorWins: arcade?.frozen_floor_round_wins_party || 0,
      cannonPaintingWins: arcade?.cannon_painting_round_wins_party || 0,
      fireLeapersWins: arcade?.fire_leapers_round_wins_party || 0,
      superSheepWins: arcade?.super_sheep_round_wins_party || 0,
    },
    pixelPainters: {
      wins: arcade?.wins_draw_their_thing || 0,
    },
    throwOut: {
      wins: arcade?.wins_throw_out || 0,
      kills: arcade?.kills_throw_out || 0,
      deaths: arcade?.deaths_throw_out || 0,
    },
    creeperAttack: {
      bestWave: arcade?.max_wave || 0,
    },
    bountyHunters: {
      wins: arcade?.wins_oneinthequiver || 0,
      kills: arcade?.kills_oneinthequiver || 0,
      deaths: arcade?.deaths_oneinthequiver || 0,
      swordKills: arcade?.sword_kills_oneinthequiver || 0,
      bountyKills: arcade?.bounty_kills_oneinthequiver || 0,
      bowKills: arcade?.bow_kills_oneinthequiver || 0,
    },
    football: {
      wins: arcade?.wins_soccer || 0,
      goals: arcade?.goals_soccer || 0,
      powerkicks: arcade?.powerkicks_soccer || 0,
      kicks: arcade?.kicks_soccer || 0,
    },
    farmHunt: {
      wins: arcade?.wins_farm_hunt || 0,
      animalWins: arcade?.animal_wins_farm_hunt || 0,
      hunterWins: arcade?.hunter_wins_farm_hunt || 0,
      kills: arcade?.kills_farm_hunt || 0,
      bowKills: arcade?.bow_kills_farm_hunt || 0,
      animalKills: arcade?.animal_kills_farm_hunt || 0,
      hunterKills: arcade?.hunter_kills_farm_hunt || 0,
      animalBowKills: arcade?.animal_bow_kills_farm_hunt || 0,
      hunterBowKills: arcade?.hunter_bow_kills_farm_hunt || 0,
      tauntsUsed: arcade?.taunts_used_farm_hunt || 0,
      safeTauntsUsed: arcade?.safe_taunts_used_farm_hunt || 0,
      riskyTauntsUsed: arcade?.risky_taunts_used_farm_hunt || 0,
      dangerousTauntsUsed: arcade?.dangerous_taunts_used_farm_hunt || 0,
      fireworksUsed: arcade?.firework_taunts_used_farm_hunt || 0,
      poopCollected: arcade?.poop_collected || 0 + arcade?.poop_collected_farm_hunt || 0,
    },
    holeInTheWall: {
      wins: arcade?.wins_hole_in_the_wall || 0,
      roundsPlayed: arcade?.rounds_hole_in_the_wall || 0,
      qualificationHighScore: arcade?.hitw_record_q || 0,
      finalHighScore: arcade?.hitw_record_f || 0,
    },
    hideAndSeek: {
      wins: arcade?.seeker_wins_hide_and_seek || 0 + arcade?.hider_wins_hide_and_seek || 0,
      seekerWins: arcade?.seeker_wins_hide_and_seek || 0,
      hiderWins: arcade?.hider_wins_hide_and_seek || 0,
      propHuntHiderWins: arcade?.prop_hunt_hider_wins_hide_and_seek || 0,
      propHuntSeekerWins: arcade?.prop_hunt_seeker_wins_hide_and_seek || 0,
      propHuntWins: (arcade?.prop_hunt_hider_wins_hide_and_seek || 0) + (arcade?.prop_hunt_seeker_wins_hide_and_seek || 0),
      partyPooperSeekerWins: arcade?.party_pooper_seeker_wins_hide_and_seek || 0,
      partyPooperHiderWins: arcade?.party_pooper_hider_wins_hide_and_seek || 0,
      partyPooperWins: (arcade?.party_pooper_seeker_wins_hide_and_seek || 0) + (arcade?.party_pooper_hider_wins_hide_and_seek || 0),
    },
    zombies: {
      wins: arcade?.wins_zombies || 0,
      alienArcadiumWins: arcade?.wins_zombies_alienarcadium || 0,
      badBloodWins: arcade?.wins_zombies_badblood || 0,
      deadEndWins: arcade?.wins_zombies_deadend || 0,
      zombieKills: arcade?.zombie_kills_zombies || 0,
      deaths: arcade?.deaths_zombies || 0,
      bulletsHit: arcade?.bullets_hit_zombies || 0,
      headshots: arcade?.headshots_zombies || 0,
      playersRevived: arcade?.players_revived_zombies || 0,
      windowsRepaired: arcade?.windows_repaired_zombies || 0,
      doorsOpened: arcade?.doors_opened_zombies || 0,
      totalRoundsSurvived: arcade?.total_rounds_survived_zombies || 0,
      highScore: arcade?.best_round_zombies || 0,
    },
  };
};

const formatArena = (arena: any) => {
  const hypixelModes = ["_1v1", "_2v2", "_4v4"];
  const pixelicModes = ["solo", "doubles", "4v4"];

  const stats: any = {
    coins: arena?.coins || 0,
    coinsSpent: arena?.coins_spent || 0,
    chests: arena?.magical_chest || 0,
    keys: arena?.keys || 0,
    activeWeapon: arena?.selected_sword || null,
    activeRune: arena?.active_rune || null,
    activeHat: arena?.hat || null,
    skills: {
      offensive: arena?.offensive || null,
      support: arena?.support || null,
      utility: arena?.utility || null,
      ultimate: arena?.ultimate || null,
    },
    combatLevels: {
      melee: arena?.lvl_damage || 0,
      health: arena?.lvl_health || 0,
      energy: arena?.lvl_energy || 0,
      cooldown: arena?.lvl_cooldown || 0,
    },
    runeLevels: {
      damage: arena?.rune_level_damage || 0,
      energy: arena?.rune_level_energy || 0,
      slowing: arena?.rune_level_slowing || 0,
      speed: arena?.rune_level_speed || 0,
    },
  };

  stats["overall"] = {};
  stats["overall"]["gamesPlayed"] = arena?.games_1v1 || 0 + arena?.games_2v2 || 0 + arena?.games_4v4 || 0;
  stats["overall"]["wins"] = arena?.wins_1v1 || 0 + arena?.wins_2v2 || 0 + arena?.wins_4v4 || 0;
  stats["overall"]["losses"] = arena?.losses_1v1 || 0 + arena?.losses_2v2 || 0 + arena?.losses_4v4 || 0;
  stats["overall"]["WLR"] = getRatio(stats["overall"]["wins"], stats["overall"]["losses"]);
  stats["overall"]["kills"] = arena?.kills_1v1 || 0 + arena?.kills_2v2 || 0 + arena?.kills_4v4 || 0;
  stats["overall"]["deaths"] = arena?.deaths_1v1 || 0 + arena?.deaths_2v2 || 0 + arena?.deaths_4v4 || 0;
  stats["overall"]["KDR"] = getRatio(stats["overall"]["kills"], stats["overall"]["deaths"]);
  stats["overall"]["damage"] = arena?.damage_1v1 || 0 + arena?.damage_2v2 || 0 + arena?.damage_4v4 || 0;
  stats["overall"]["healed"] = arena?.healed_1v1 || 0 + arena?.healed_2v2 || 0 + arena?.healed_4v4 || 0;

  for (const mode in hypixelModes) {
    stats[pixelicModes[mode]] = {};
    stats[pixelicModes[mode]]["gamesPlayed"] = arena?.[`games${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["wins"] = arena?.[`wins${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["losses"] = arena?.[`losses${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["WLR"] = getRatio(stats[pixelicModes[mode]]["wins"], stats[pixelicModes[mode]]["losses"]);
    stats[pixelicModes[mode]]["kills"] = arena?.[`kills${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["deaths"] = arena?.[`deaths${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["KDR"] = getRatio(stats[pixelicModes[mode]]["kills"], stats[pixelicModes[mode]]["deaths"]);
    stats[pixelicModes[mode]]["damage"] = arena?.[`damage${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["healed"] = arena?.[`healed${hypixelModes[mode]}`] || 0;
  }

  return stats;
};

const formatWarlords = (battleground: any) => {
  return {
    coins: battleground?.coins || 0,
    wins: battleground?.wins || 0,
    winsCTF: battleground?.wins_capturetheflag || 0,
    winsDomination: battleground?.wins_domination || 0,
    winsDeatmatch: battleground?.wins_teamdeathmatch || 0,
    kills: battleground?.kills || 0,
    deaths: battleground?.deaths || 0,
    KDR: getRatio(battleground?.kills, battleground?.deaths) || 0,
    assists: battleground?.ssists || 0,
    weaponsRepaired: battleground?.repaired || 0,
    flagsCaptured: battleground?.flag_conquer_self || 0,
    flagsReturned: battleground?.flag_returns || 0,
  };
};

const formatBuildBattle = (buildBattle: any) => {
  ///////////////////////////////////////////////////////////////////////////
  //     fromEntries(), pickKeys() and themeRating is from Slothpixel      //
  ///////////////////////////////////////////////////////////////////////////
  const fromEntries = (array: any[]) => {
    return array.reduce((object: any, [key, value]: any) => {
      object[key] = value;
      return object;
    }, {});
  };
  const pickKeys = (object: any, options: any) => {
    const regexp = options.regexp || /.+/;
    const filter = options.filter || (() => true);
    const keyMap = options.keyMap || ((key: any) => key);
    const valueMap = options.valueMap || ((value: any) => value);

    return fromEntries(
      Object.entries(object)
        .filter(([key, value]) => regexp.test(key) && filter(key, value))
        .map(([key, value]) => [keyMap(key), valueMap(value)])
    );
  };
  const themeRatings = pickKeys(buildBattle || {}, {
    regexp: /votes_.*/,
    keyMap: (key: any) => key.replace("votes_", ""),
  });
  return {
    coins: buildBattle?.coins || 0,
    score: buildBattle?.score || 0,
    gamesPlayed: buildBattle?.games_played || 0,
    wins: buildBattle?.wins || 0,
    winsSoloNormal: buildBattle?.wins_solo_normal || 0,
    winsSoloPro: buildBattle?.wins_solo_pro || 0,
    winsTeamNormal: buildBattle?.wins_teams_normal || 0,
    winsGTB: buildBattle?.wins_guess_the_build || 0,
    WLR: getRatio(buildBattle?.wins || 0, (buildBattle?.games_played || 0) - (buildBattle?.wins || 0)),
    totalVotes: buildBattle?.total_votes || 0,
    superVotes: buildBattle?.super_votes || 0,
    correctGuesses: buildBattle?.correct_guesses || 0,
    loadOut: buildBattle?.buildbattle_loadout || [],
    selectedHat: buildBattle?.new_selected_hat || null,
    selectedVictoryDance: buildBattle?.new_victory_dance || null,
    selectedSuit: buildBattle?.new_suit || null,
    selectedMovementTrail: buildBattle?.active_movement_trail || null,
    selectedBackdrop: buildBattle?.selected_backdrop || null,
    themeRatings: themeRatings,
  };
};

const formatTKR = (gingerBread: any) => {
  const retroWins = (gingerBread?.gold_trophy_retro || 0) + (gingerBread?.silver_trophy_retro || 0) + (gingerBread?.bronze_trophy_retro || 0);
  const hypixelGPWins = (gingerBread?.gold_trophy_hypixelgp || 0) + (gingerBread?.silver_trophy_hypixelgp || 0) + (gingerBread?.bronze_trophy_hypixelgp || 0);
  const jungleRushWins = (gingerBread?.gold_trophy_junglerush || 0) + (gingerBread?.gold_trophy_junglerush || 0) + (gingerBread?.bronze_trophy_junglerush || 0);
  const olympusWins = (gingerBread?.gold_trophy_olympus || 0) + (gingerBread?.silver_trophy_olympus || 0) + (gingerBread?.bronze_trophy_olympus || 0);
  const canyonWins = (gingerBread?.gold_trophy_canyon || 0) + (gingerBread?.silver_trophy_canyon || 0) + (gingerBread?.bronze_trophy_canyon || 0);
  const gamesPlayed = (gingerBread?.retro_plays || 0) + (gingerBread?.hypixelgp_plays || 0) + (gingerBread?.junglerush_plays || 0) + (gingerBread?.olympus_plays || 0) + (gingerBread?.canyon_plays || 0);
  return {
    coins: gingerBread?.coins || 0,
    coinsPickedUp: gingerBread?.coins_picked_up || 0,
    lapsCompleted: gingerBread?.laps_completed || 0,
    boxPickedUp: gingerBread?.box_pickups || 0,
    bananasSent: gingerBread?.banana_hits_sent || 0,
    bananasReceived: gingerBread?.banana_hits_received || 0,
    overall: {
      gamesPlayed: gamesPlayed,
      WLR: getRatio(gingerBread?.wins || 0, gamesPlayed),
      trophies: {
        gold: gingerBread?.gold_trophy || 0,
        siver: gingerBread?.silver_trophy || 0,
        bronze: gingerBread?.bronze_trophy || 0,
      },
    },
    retro: {
      gamesPlayed: gingerBread?.retro_plays || 0,
      WLR: getRatio(retroWins, gingerBread?.retro_plays),
      trophies: {
        gold: gingerBread?.gold_trophy_retro || 0,
        silver: gingerBread?.silver_trophy_retro || 0,
        bronze: gingerBread?.bronze_trophy_retro || 0,
      },
    },
    hypixelGP: {
      gamesPlayed: gingerBread?.hypixelgp_plays || 0,
      WLR: getRatio(hypixelGPWins, gingerBread?.hypixelgp_plays),
      trophies: {
        gold: gingerBread?.gold_trophy_hypixelgp || 0,
        silver: gingerBread?.silver_trophy_hypixelgp || 0,
        bronze: gingerBread?.bronze_trophy_hypixelgp || 0,
      },
    },
    jungleRush: {
      gamesPlayed: gingerBread?.junglerush_plays || 0,
      WLR: getRatio(jungleRushWins, gingerBread?.junglerush_plays),
      trophies: {
        gold: gingerBread?.gold_trophy_junglerush || 0,
        silver: gingerBread?.silver_trophy_junglerush || 0,
        bronze: gingerBread?.bronze_trophy_junglerush || 0,
      },
    },
    olympus: {
      gamesPlayed: gingerBread?.olympus_plays || 0,
      WLR: getRatio(olympusWins, gingerBread?.olympus_plays),
      trophies: {
        gold: gingerBread?.gold_trophy_olympus || 0,
        silver: gingerBread?.silver_trophy_olympus || 0,
        bronze: gingerBread?.bronze_trophy_olympus || 0,
      },
    },
    canyon: {
      gamesPlayed: gingerBread?.canyon_plays || 0,
      WLR: getRatio(canyonWins, gingerBread?.canyon_plays),
      trophies: {
        gold: gingerBread?.gold_trophy_canyon || 0,
        silver: gingerBread?.silver_trophy_canyon || 0,
        bronze: gingerBread?.bronze_trophy_canyon || 0,
      },
    },
  };
};

const formatMurderMystery = (murderMystery: any) => {
  const hypixelModes = ["", "_MURDER_CLASSIC", "_MURDER_DOUBLE_UP", "_MURDER_ASSASSINS", "_MURDER_INFECTION"];
  const pixelicModes = ["overall", "classic", "doubleUp", "assassins", "infection"];

  const stats: any = {};

  stats["coins"] = murderMystery?.coins || 0;
  stats["chests"] = murderMystery?.granted_chests || 0;

  for (const mode in hypixelModes) {
    stats[pixelicModes[mode]] = {};
    stats[pixelicModes[mode]]["gamesPlayed"] = murderMystery?.[`games${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["wins"] = murderMystery?.[`wins${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["murderWins"] = murderMystery?.[`murderer_wins${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["detectiveWins"] = murderMystery?.[`detective_wins${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["losses"] = stats[pixelicModes[mode]]["gamesPlayed"] - stats[pixelicModes[mode]]["wins"];
    stats[pixelicModes[mode]]["WLR"] = getRatio(stats[pixelicModes[mode]]["wins"], stats[pixelicModes[mode]]["losses"]);
    stats[pixelicModes[mode]]["kills"] = murderMystery?.[`kills${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["bowKills"] = murderMystery?.[`bow_kills${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["knifeKills"] = murderMystery?.[`knife_kills${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["thrownKnifeKills"] = murderMystery?.[`thrown_knife_kills${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["trapKills"] = murderMystery?.[`trap_kills${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["deaths"] = murderMystery?.[`deaths${hypixelModes[mode]}`] || 0;
    stats[pixelicModes[mode]]["KDR"] = getRatio(stats[pixelicModes[mode]]["kills"], stats[pixelicModes[mode]]["deaths"]);
    stats[pixelicModes[mode]]["timesHero"] = murderMystery?.[`was_hero${hypixelModes[mode]}`] || 0;
  }

  stats["overall"]["murdererChance"] = murderMystery?.[`murderer_chance`] || 0;
  stats["overall"]["detectiveChance"] = murderMystery?.[`detective_chance`] || 0;

  return stats;
};

const formatPit = async (pit: any) => {
  const getData = async (rawData: any) => {
    if (rawData === null) {
      return {};
    }
    const getNBT = async (string: string) => {
      const buffer = Buffer.from(string);
      const parsedNBT = await parseNbt(buffer);
      return nbt.simplify(parsedNBT)["i"];
    };
    var data = [];
    const RawData = await getNBT(rawData || "");
    for (const item in RawData) {
      if (Object.keys(RawData[item]).length !== 0) {
        const nbt = RawData[item]["tag"];
        const getEnchants = (Data: any) => {
          if (Data == null) {
            return undefined;
          }
          var data = [];
          for (const enchantment in Data) {
            data.push({ name: Data[enchantment]["Key"], level: Data[enchantment]["Level"] });
          }
          return data;
        };
        data.push({
          ID: RawData[item]["id"],
          minecraftName: minecraftItems.get(RawData[item]["id"])?.["name"] || "Unkown",
          hypixelName: nbt?.["display"]?.["Name"] || undefined,
          hypixelLore: nbt?.["display"]?.["lore"] || undefined,
          enchantments: getEnchants(nbt?.["ExtraAttributes"]?.["CustomEnchants"] || null),
          upgradeTier: nbt?.["ExtraAttributes"]?.["UpgradeTier"] || undefined,
          lives: nbt?.["ExtraAttributes"]?.["Lives"] || undefined,
          maxLives: nbt?.["ExtraAttributes"]?.["MaxLibes"] || undefined,
          nonce: nbt?.["ExtraAttributes"]?.["Nonce"] || undefined,
          count: RawData[item]["count"],
        });
      } else {
        data.push({});
      }
    }
    return data;
  };
  const getFavorites = (Data: any) => {
    if (Data === null) {
      return {};
    }
    const data = [];
    for (const ID of Data) {
      if (ID === 0) {
        data.push({});
      } else {
        data.push({ ID: ID, minecraftName: minecraftItems.get(ID)?.["name"] || "Unkown" });
      }
    }
    return data;
  };
  var renownUnlocks:
    | {
        tier: number;
        timestamp: number;
        key: string;
      }[]
    | null = [];
  if (pit?.profile?.renown_unlocks) {
    for (const renown of pit?.profile?.renown_unlocks) {
      renownUnlocks.push({ tier: renown.tier, timestamp: Math.floor(renown.acquireDate / 1000), key: renown.key });
    }
  } else {
    renownUnlocks = null;
  }

  return {
    EXP: pit?.profile?.xp || 0,
    prestige: pit?.profile?.prestiges?.length || 0,
    gold: Math.round(pit?.profile?.cash || 0),
    goldEarned: Math.round(pit?.pit_stats_ptl?.cash_earned || 0),
    kills: pit?.pit_stats_ptl?.kills || 0,
    ramboKills: pit?.pit_stats_ptl?.rambo_kills || 0,
    assists: pit?.pit_stats_ptl?.assists || 0,
    deaths: pit?.pit_stats_ptl?.deaths || 0,
    swordHits: pit?.pit_stats_ptl?.sword_hits || 0,
    arrowsHit: pit?.pit_stats_ptl?.arrow_hits || 0,
    arrowsShot: pit?.pit_stats_ptl?.arrows_fired || 0,
    AHMR: getRatio(pit?.pit_stats_ptl?.arrow_hits || 0, pit?.pit_stats_ptl?.arrows_fired || 0),
    leftClicks: pit?.pit_stats_ptl?.left_clicks || 0,
    goldenApplesEaten: pit?.pit_stats_ptl?.gapple_eaten || 0,
    goldenHeadsEaten: pit?.pit_stats_ptl?.ghead_eaten || 0,
    soupsDrank: pit?.pit_stats_ptl?.soups_drank || 0,
    blocksPlaced: pit?.pit_stats_ptl?.blocks_placed || 0,
    blocksBroken: pit?.pit_stats_ptl?.blocks_broken || 0,
    chatMessages: pit?.pit_stats_ptl?.chat_messages || 0,
    playtime: pit?.pit_stats_ptl?.playtime_minutes || 0,
    renown: pit?.profile?.renown || 0,
    renownUnlocks: renownUnlocks,
    contractsStarted: pit?.pit_stats_ptl?.contracts_started || 0,
    constractsCompleted: pit?.pit_stats_ptl?.contracts_completed || 0,
    nightQuestsCompleted: pit?.pit_stats_ptl?.night_quests_completed || 0,
    kingQuest: pit?.profile?.king_quest || 0,
    darkPantsCreated: pit?.pit_stats_ptl?.dark_pants_crated || 0,
    maxStreak: pit?.pit_stats_ptl?.max_streak || 0,
    joins: pit?.pit_stats_ptl?.joins || 0,
    timesJumpedIntoThePit: pit?.pit_stats_ptl?.jumped_into_pit || 0,
    lastSave: pit?.profile?.last_save ? Math.floor(pit.profile.last_save / 1000) : null,
    damageDealt: {
      total: pit?.pit_stats_ptl?.damage_dealt || 0,
      melee: pit?.pit_stats_ptl?.melee_damage_dealt || 0,
      bow: pit?.pit_stats_ptl?.bow_damage_dealt || 0,
    },
    damageTaken: {
      total: pit?.pit_stats_ptl?.damage_received || 0,
      melee: pit?.pit_stats_ptl?.melee_damage_received || 0,
      bow: pit?.pit_stats_ptl?.bow_damage_received || 0,
    },
    selectedPerks: {
      1: pit?.profile?.selected_perk_0 || null,
      2: pit?.profile?.selected_perk_1 || null,
      3: pit?.profile?.selected_perk_2 || null,
      4: pit?.profile?.selected_perk_3 || null,
    },
    items: {
      armor: await getData(pit?.profile?.inv_armor?.data || null),
      inventory: await getData(pit?.profile?.inv_contents?.data || null),
      enderchest: await getData(pit?.profile?.inv_enderchest?.data || null),
      stash: await getData(pit?.profile?.item_stash?.data || null),
      hotbarFavorites: getFavorites(pit?.profile?.hotbar_favorites || null),
    },
  };
};

const formatTNT = (tntGames: any) => {
  const wins = (tntGames?.wins_tntrun || 0) + (tntGames?.wins_pvprun || 0) + (tntGames?.wins_tntag || 0) + tntGames?.wins_bowspleef || 0 + (tntGames?.wins_capture || 0);
  const losses = (tntGames?.deaths_tntrun || 0) + (tntGames?.deaths_pvprun || 0) + (tntGames?.deaths_tntag || 0) + (tntGames?.deaths_bowspleef || 0) + (tntGames?.deaths_capture || 0);
  const kills = (tntGames?.kills_pvprun || 0) + (tntGames?.kills_tntag || 0) + (tntGames?.kills_capture || 0);
  const deaths = (tntGames?.deaths_pvprun || 0) + (tntGames?.deaths_tntag || 0) + (tntGames?.deaths_capture || 0);
  return {
    coins: tntGames?.coins || 0,
    overall: {
      wins: wins,
      losses: losses,
      WLR: getRatio(wins, losses),
      kills: kills,
      deaths: deaths,
      KDR: getRatio(kills, deaths),
    },
    tntRun: {
      wins: tntGames?.wins_tntrun || 0,
      losses: tntGames?.deaths_tntrun || 0,
      WLR: getRatio(tntGames?.wins_tntrun || 0, tntGames?.deaths_tntrun || 0),
      longestTimeSurvived: tntGames?.record_tntrun || 0,
    },
    pvpRun: {
      wins: tntGames?.wins_pvprun || 0,
      losses: tntGames?.deaths_pvprun || 0,
      WLR: getRatio(tntGames?.wins_pvprun || 0, tntGames?.deaths_pvprun || 0),
      kills: tntGames?.kills_pvprun || 0,
      deaths: tntGames?.deaths_pvprun || 0,
      KDR: getRatio(tntGames?.kills_pvprun || 0, tntGames?.deaths_pvprun || 0),
      longestTimeSurvived: tntGames?.record_pvprun || 0,
    },
    tntTag: {
      wins: tntGames?.wins_tntag || 0,
      losses: tntGames?.deaths_tntag || 0,
      WLR: getRatio(tntGames?.wins_tntag || 0, tntGames?.deaths_tntag || 0),
      kills: tntGames?.kills_tntag || 0,
      deaths: tntGames?.deaths_tntag || 0,
      KDR: getRatio(tntGames?.kills_tntag || 0, tntGames?.deaths_tntag || 0),
    },
    bowSpleef: {
      wins: tntGames?.wins_bowspleef || 0,
      losses: tntGames?.deaths_bowspleef || 0,
      WLR: getRatio(tntGames?.wins_bowspleef || 0, tntGames?.deaths_bowspleef || 0),
    },
    wizards: {
      wins: tntGames?.wins_capture || 0,
      losses: tntGames?.deaths_capture || 0,
      WLR: getRatio(tntGames?.wins_capture || 0, tntGames?.deaths_capture || 0),
      kills: tntGames?.kills_capture || 0,
      assists: tntGames?.assists_capture || 0,
      deaths: tntGames?.deaths_capture || 0,
      KDR: getRatio(tntGames?.kills_capture || 0, tntGames?.deaths_capture || 0),
    },
  };
};

const formatBlitz = (hungerGames: any) => {
  return {
    coins: hungerGames?.coins || 0,
    gamesPlayed: hungerGames?.games_played || 0,
    wins: hungerGames?.wins || 0,
    teamWins: hungerGames?.wins_teams || 0,
    ramboWins: hungerGames?.rambo_wins || 0,
    ramdomWins: hungerGames?.random_wins || 0,
    WLR: getRatio(hungerGames?.wins || 0, (hungerGames?.games_played || 0) - (hungerGames?.wins || 0)),
    kills: hungerGames?.kills || 0,
    tauntKills: hungerGames?.taunt_kills || 0,
    deaths: hungerGames?.deaths || 0,
    KDR: getRatio(hungerGames?.kills || 0, hungerGames?.deaths || 0),
    damageDealt: hungerGames?.damage || 0,
    damageTaken: hungerGames?.damage_taken || 0,
    potionsDrunk: hungerGames?.potions_drunk || 0,
    potionsThrown: hungerGames?.potions_thrown || 0,
    mobsSpawned: hungerGames?.mobs_spawned || 0,
    arrowsShot: hungerGames?.arrows_fired || 0,
    arrowsHit: hungerGames?.arrows_hit || 0,
    AHMR: getRatio(hungerGames?.arrows_hit || 0, hungerGames?.arrows_fire || 0),
    blitzesUsed: hungerGames?.blitz_uses || 0,
    chestsOpenened: hungerGames?.chests_opened || 0,
    timePlayed: hungerGames?.time_played || 0,
  };
};

const formatCopsAndCrims = (MCGO: any) => {
  return {
    coins: MCGO?.coins || 0,
    wins: MCGO?.game_wins || 0,
    roundsWon: MCGO?.round_wins || 0,
    kills: MCGO?.kills || 0,
    copKills: MCGO?.cop_kills || 0,
    criminialKills: MCGO?.criminal_kills || 0,
    grenadeKills: (MCGO?.grenade_kills || 0) + (MCGO?.grenadeKills || 0),
    headshotKills: MCGO?.headshot_kills || 0,
    deaths: MCGO?.deaths || 0,
    KDR: getRatio(MCGO?.kills || 0, MCGO?.deaths || 0),
    bombsPlanted: MCGO?.bombs_planted || 0,
    bombsDefused: MCGO?.bombs_defused || 0,
    prefix: MCGO?.selected_lobby_prefix || null,
    prefixShown: MCGO?.show_lobby_prefix || false,
    shotsFired: MCGO?.shots_fired || 0,
    mapWins: {
      alleyway: MCGO?.game_wins_alleyway || 0,
      atomic: MCGO?.game_wins_atomic || 0,
      carrier: MCGO?.game_wins_carrier || 0,
      melonFactory: MCGO?.game_wins_melon_factory || 0,
      overgrown: MCGO?.game_wins_overgrown || 0,
      reserve: MCGO?.game_wins_reserve || 0,
      sandstorm: MCGO?.game_wins_sandstorm || 0,
      temple: MCGO?.game_wins_temple || 0,
    },
    deathmatch: {
      wins: MCGO?.game_wins_deathmatch || 0,
      kills: MCGO?.kills_deathmatch || 0,
      deaths: MCGO?.deaths_deathmatch || 0,
      KDR: getRatio(MCGO?.kills_deathmatch || 0, MCGO?.deaths_deathmatch || 0),
      copKills: MCGO?.cop_kills_deathmatch || 0,
      criminalKills: MCGO?.criminal_kills_deathmatch || 0,
    },
    perks: {
      player: {
        bodyArmorCost: MCGO?.body_armor_cost || 0,
        bountyHunter: MCGO?.bounty_hunter || 0,
        pocketChange: MCGO?.pocket_change || 0,
        strengthTraining: MCGO?.strength_training || 0,
      },
      carbine: {
        costReduction: MCGO?.carbine_cost_reduction || 0,
        damageIncrease: MCGO?.carbine_damage_increase || 0,
        recoilReduction: MCGO?.carbine_recoil_reduction || 0,
        reloadSpeedReduction: MCGO?.carbine_reload_speed_reduction || 0,
      },
      knife: {
        attackDelay: MCGO?.knife_attack_delay || 0,
        damageIncrease: MCGO?.knife_damage_increase || 0,
      },
      magnum: {
        costReduction: MCGO?.magnum_cost_reduction || 0,
        damageIncrease: MCGO?.magnum_damage_increase || 0,
        recoilReduction: MCGO?.magnum_recoil_reduction || 0,
        reloadSpeedReduction: MCGO?.magnum_reload_speed_reduction || 0,
      },
      pistol: {
        damageIncrease: MCGO?.pistol_damage_increase || 0,
        recoilReduction: MCGO?.pistol_recoil_reduction || 0,
        reloadSpeedReduction: MCGO?.pistol_reload_speed_reduction || 0,
      },
      rifle: {
        costReduction: MCGO?.rifle_cost_reduction || 0,
        damageIncrease: MCGO?.rifle_damage_increase || 0,
        recoilReduction: MCGO?.rifle_recoil_reduction || 0,
        reloadSpeedReduction: MCGO?.rifle_reload_speed_reduction || 0,
      },
      shotgun: {
        costReduction: MCGO?.shotgun_cost_reduction || 0,
        damageIncrease: MCGO?.shotgun_damage_increase || 0,
        recoilReduction: MCGO?.shotgun_recoil_reduction || 0,
        reloadSpeedReduction: MCGO?.shotgun_reload_speed_reduction || 0,
      },
      smg: {
        costReduction: MCGO?.smg_cost_reduction || 0,
        damageIncrease: MCGO?.smg_damage_increase || 0,
        recoilReduction: MCGO?.smg_recoil_reduction || 0,
        reloadSpeedReduction: MCGO?.smg_reload_speed_reduction || 0,
      },
      sniper: {
        chargeBonus: MCGO?.sniper_charge_bonus || 0,
        costReduction: MCGO?.sniper_cost_reduction || 0,
        damageIncrease: MCGO?.sniper_damage_increase || 0,
        reloadSpeedReduction: MCGO?.sniper_reload_speed_reduction || 0,
      },
    },
    selectedCosmetics: {
      carbine: MCGO?.selectedCarbineDev || null,
      creeperHelmet: MCGO?.selectedCreeperHelmetDev || null,
      creeperChestplate: MCGO?.selectedCreeperChestplateDev || null,
      knife: MCGO?.selectedKnifeDev || null,
      magnum: MCGO?.selectedMagnumDev || null,
      ocelotHelmet: MCGO?.selectedOcelotHelmetDev || null,
      ocelotChestplate: MCGO?.selectedOcelotChestplateDev || null,
      pistol: MCGO?.selectedPistolDev || null,
      rifle: MCGO?.selectedRifleDev || null,
      shotgun: MCGO?.selectedShotgunDev || null,
      smg: MCGO?.selectedSmgDev || null,
    },
  };
};

const formatPaintball = (paintball: any) => {
  return {
    coins: paintball?.coins || 0,
    kills: paintball?.kills || 0,
    deaths: paintball?.deaths || 0,
    KDR: getRatio(paintball?.kills || 0, paintball?.deaths || 0),
    wins: paintball?.wins || 0,
    killstreaks: paintball?.killstreaks || 0,
    shotsFired: paintball?.shots_fired || 0,
    activeHat: paintball?.hat || null,
    forceFieldTime: paintball?.forcefieldTime || 0,
    perks: {
      adrenaline: (paintball?.adrenaline || 0) + 1,
      endurance: (paintball?.endurance || 0) + 1,
      fortune: (paintball?.fortune || 0) + 1,
      godfather: (paintball?.godfather || 0) + 1,
      superluck: (paintball?.superluck || 0) + 1,
      transfusion: (paintball?.transfusion || 0) + 1,
    },
    votes: {
      babyland: paintball?.votes_Babyland || 0,
      boletus: paintball?.votes_Boletus || 0,
      courtyard: paintball?.votes_Courtyard || 0,
      gladiator: paintball?.votes_Gladiator || 0,
      herobrine: paintball?.votes_Herobrine || 0,
      juice: paintball?.votes_Juice || 0,
      lalaland: paintball?.votes_LaLaLand || 0,
      octagon: paintball?.votes_Octagon || 0,
      ohCanada: paintball?.votes_OhCanada || 0,
      outback: paintball?.votes_Outback || 0,
      victorian: paintball?.votes_Victorian || 0,
    },
  };
};

const formatQuake = (quake: any) => {
  return {
    coins: quake?.coins || 0,
    highestKillstreak: quake?.highest_killstreak,
    dashPower: Number(quake?.dash_power || 0),
    dashCooldown: Number(quake?.dash_cooldown || 0),
    overall: {
      wins: (quake?.wins || 0) + (quake?.wins_teams || 0),
      kills: (quake?.kills || 0) + (quake?.kills_teams || 0),
      deaths: (quake?.deaths || 0) + (quake?.deaths_teams || 0),
      KDR: getRatio((quake?.kills || 0) + (quake?.kills_teams || 0), (quake?.deaths || 0) + (quake?.deaths_teams || 0)),
      KWR: getRatio((quake?.kills || 0) + (quake?.kills_teams || 0), (quake?.wins || 0) + (quake?.wins || 0)),
      killstreaks: (quake?.killstreaks || 0) + (quake?.killstreaks_teams || 0),
      killsDeathmatch: (quake?.kills_dm || 0) + (quake?.kills_dm_teams || 0),
      distanceTravelled: (quake?.distance_travelled || 0) + (quake?.distance_travelled_teams || 0),
      shotsFired: (quake?.shots_fired || 0) + (quake?.shots_fired_teams || 0),
      headshots: (quake?.headshots || 0) + (quake?.headshots_teams || 0),
    },
    solo: {
      wins: quake?.wins || 0,
      kills: quake?.kills || 0,
      deaths: quake?.deaths || 0,
      KDR: getRatio(quake?.kills || 0, quake?.deaths || 0),
      KWR: getRatio(quake?.kills || 0, quake?.wins || 0),
      killstreaks: quake?.killstreaks || 0,
      killsDeathmatch: quake?.kills_dm || 0,
      distanceTravelled: quake?.distance_travelled || 0,
      shotsFired: quake?.shots_fired || 0,
      headshots: quake?.headshots || 0,
    },
    doubles: {
      wins: quake?.wins_teams || 0,
      kills: quake?.kills_teams || 0,
      deaths: quake?.deaths_teams || 0,
      KDR: getRatio(quake?.kills_teams || 0, quake?.deaths_teams || 0),
      KWR: getRatio(quake?.kills || 0, quake?.wins || 0),
      killstreaks: quake?.killstreaks_teams || 0,
      killsDeathmatch: quake?.kills_dm_teams || 0,
      distanceTravelled: quake?.distance_travelled_teams || 0,
      shotsFired: quake?.shots_fired_teams || 0,
      headshots: quake?.headshots_teams || 0,
    },
    selectedCosmetics: {
      barrel: quake?.barrel || null,
      case: quake?._case || null,
      killsound: quake?.killsound || null,
      muzzle: quake?.muzzle || null,
      sight: quake?.sight || null,
      trigger: quake?.trigger || null,
      beam: quake?.beam || null,
    },
    votes: {
      apex: quake?.votes_Apex || 0,
      apex2: quake?.votes_ApexII || 0,
      ascended: quake?.votes_Ascended || 0,
      belmorn: quake?.votes_Belmorn || 0,
      coldWar: quake?.votes_Cold_War || 0,
      demonic: quake?.votes_Demonic || 0,
      depths: quake?.votes_Depths || 0,
      digsite: quake?.votes_DigSite || 0,
      digsite2: quake?.votes_DigSite2 || 0,
      fryst: quake?.votes_Fryst || 0,
      lostWorld: quake?.votes_Lost_World || 0,
      martian: quake?.votes_Martian || 0,
      reactor: quake?.votes_Reactor || 0,
      sero: quake?.votes_Sero || 0,
    },
  };
};

const formatSpeedUHC = (speedUHC: any) => {
  return {
    coins: speedUHC?.coins || 0,
    arrowsShot: speedUHC?.arrows_shot || 0,
    arrowsHit: speedUHC?.arrows_hit || 0,
    AHMR: getRatio(speedUHC?.arrows_shot || 0, speedUHC?.arrows_hit || 0),
    blocksBroken: speedUHC?.blocks_broken || 0,
    blocksPlaced: speedUHC?.blocks_placed || 0,
    itemsEnchanted: speedUHC?.items_enchanted || 0,
    quits: speedUHC?.quits || 0,
    salt: speedUHC?.salt || 0,
    tears: speedUHC?.tears || 0,
    tearsGathered: speedUHC?.tears_gathered || 0,
    tearWellUses: speedUHC?.tearWellUses || 0,
    enderpearlsThrown: speedUHC?.enderpearls_thrown || 0,
    highestKillstreak: speedUHC?.highestKillstreak || 0,
    highestWinstreak: speedUHC?.highestWinstreak || 0,
    overall: {
      gamesPlayed: speedUHC?.games || 0,
      wins: speedUHC?.wins || 0,
      winstreak: speedUHC?.winstreak || 0,
      losses: speedUHC?.losses || 0,
      WLR: getRatio(speedUHC?.wins || 0, speedUHC?.losses || 0),
      kills: speedUHC?.kills || 0,
      assists: speedUHC?.assists || 0,
      deaths: speedUHC?.deaths || 0,
      KDR: getRatio(speedUHC?.kills || 0, speedUHC?.deaths || 0),
      killstreaks: speedUHC?.killstreak || 0,
      survivedPlayers: speedUHC?.survived_players || 0,
    },
    solo: {
      gamesPlayed: speedUHC?.games_solo || 0,
      wins: speedUHC?.wins_solo || 0,
      winstreak: speedUHC?.winstreak_solo || 0,
      losses: speedUHC?.losses_solo || 0,
      WLR: getRatio(speedUHC?.wins_solo || 0, speedUHC?.losses_solo || 0),
      kills: speedUHC?.kills_solo || 0,
      assists: speedUHC?.assists_solo || 0,
      deaths: speedUHC?.deaths_solo || 0,
      KDR: getRatio(speedUHC?.kills_solo || 0, speedUHC?.deaths_solo || 0),
      killstreaks: speedUHC?.killstreak_solo || 0,
      survivedPlayers: speedUHC?.survived_players_solo || 0,
    },
    doubles: {
      gamesPlayed: speedUHC?.games_team || 0,
      wins: speedUHC?.wins_team || 0,
      winstreak: speedUHC?.winstreak_team || 0,
      losses: speedUHC?.losses_team || 0,
      WLR: getRatio(speedUHC?.wins_team || 0, speedUHC?.losses_team || 0),
      kills: speedUHC?.kills_team || 0,
      assists: speedUHC?.assists_team || 0,
      deaths: speedUHC?.deaths_team || 0,
      KDR: getRatio(speedUHC?.kills_team || 0, speedUHC?.deaths_team || 0),
      killstreaks: speedUHC?.killstreak_team || 0,
      survivedPlayers: speedUHC?.survived_players_team || 0,
    },
    votes: {
      hailstone: speedUHC?.votes_Hailstone || 0,
      pinnacle: speedUHC?.votes_Pinnacle || 0,
      plains: speedUHC?.votes_Plains || 0,
      taiga: speedUHC?.votes_Taiga || 0,
    },
  };
};

const formatSmash = (superSmash: any) => {
  return {
    coins: superSmash?.coins || 0,
    gamesPlayed: superSmash?.games || 0,
    wins: superSmash?.wins || 0,
    winstreak: superSmash?.win_streak || 0,
    losses: superSmash?.losses || 0,
    WLR: getRatio(superSmash?.wins || 0, superSmash?.losses || 0),
    kills: superSmash?.kills || 0,
    deaths: superSmash?.deaths || 0,
    KDR: getRatio(superSmash?.kills || 0, superSmash?.deaths || 0),
    quits: superSmash?.quits || 0,
    smashLevel: superSmash?.smashLevel || 0,
    activeClass: superSmash?.active_class || null,
    votes: {
      strawberryTowers: superSmash?.votes_StrawberryTowers || 0,
      toybox: superSmash?.votes_Toybox || 0,
      gunmetal: superSmash?.votes_Gunmetal || 0,
      colorClash: superSmash?.votes_ColorClash || 0,
      triplets: superSmash?.votes_Triplets || 0,
      luxor: superSmash?.votes_Luxor || 0,
      cubed: superSmash?.votes_Cubed || 0,
    },
  };
};

const formatWalls = (walls: any) => {
  return {
    coins: walls?.coins || 0,
    wins: walls?.wins || 0,
    losses: walls?.losses || 0,
    kills: walls?.kills || 0,
    assists: walls?.assists || 0,
    deaths: walls?.deaths || 0,
    KDR: getRatio(walls?.kills || 0, walls?.deaths || 0),
    WLR: getRatio(walls?.wins || 0, walls?.losses || 0),
    perks: {
      adrenaline: walls?.adrenaline || 0,
      berserk: walls?.berserk || 0,
      chainkille: walls?.chainkiller || 0,
      expert_min: walls?.expert_miner || 0,
      finalForm: walls?.final_form || 0,
      fortune: walls?.fortune || 0,
      haste: walls?.haste || 0,
      opportunit: walls?.opportunity || 0,
      shoutCoun: walls?.shout_count || 0,
      swift: walls?.swift || 0,
      tenacity: walls?.tenacity || 0,
      vampirism: walls?.vampirism || 0,
      vitality: walls?.vitality || 0,
    },
    votes: {
      egypt: walls?.votes_Egypt || 0,
      loveland: walls?.votes_LoveLand || 0,
    },
  };
};

const formatMegaWalls = (megaWalls: any) => {
  return {
    coins: megaWalls?.coins || 0,
    wins: megaWalls?.wins || 0,
    losses: megaWalls?.losses || 0,
    WLR: getRatio(megaWalls?.wins || 0, megaWalls?.losses || 0),
    finalKills: megaWalls?.final_kills || 0,
    finalAssists: megaWalls?.final_assists || 0,
    finalDeaths: megaWalls?.final_deaths || 0,
    FKDR: getRatio(megaWalls?.final_kills || 0, megaWalls?.final_deaths || 0),
    kills: megaWalls?.kills || 0,
    assists: megaWalls?.assists || 0,
    deaths: megaWalls?.deaths || 0,
    KDR: getRatio(megaWalls?.kills || 0, megaWalls?.deaths || 0),
    witherDamage: megaWalls?.wither_damage || 0,
    defenderKills: megaWalls?.defender_kills || 0,
  };
};

const formatVampireZ = (vampireZ: any) => {
  return {
    coins: vampireZ?.coins || 0,
    goldBought: vampireZ?.gold_bought || 0,
    zombieKills: vampireZ?.zombie_kills || 0,
    human: {
      wins: vampireZ?.human_wins || 0,
      kills: vampireZ?.human_kills || 0,
      deaths: vampireZ?.human_deaths || 0,
      KDR: getRatio(vampireZ?.human_kills || 0, vampireZ?.human_deaths || 0),
    },
    vampire: {
      wins: vampireZ?.vampires_wins || 0,
      kills: vampireZ?.vampire_kills || 0,
      deaths: vampireZ?.vampire_deaths || 0,
      KDR: getRatio(vampireZ?.vampire_kills || 0, vampireZ?.vampire_deaths || 0),
      mostKills: vampireZ?.most_vampire_kills_new,
    },
    perks: {
      explosiveKiller: vampireZ?.explosive_killer || 0,
      fireproofing: vampireZ?.fireproofing || 0,
      frankensteinsMonster: vampireZ?.frankensteins_monster || 0,
      goldBooster: vampireZ?.gold_booster || 0,
      goldStarter: vampireZ?.gold_starter || 0,
      renfield: vampireZ?.renfield || 0,
      transfusion: vampireZ?.transfusion || 0,
      vampireDoubler: vampireZ?.vampire_doubler || 0,
      vampiricMinion: vampireZ?.vampiric_minion || 0,
    },
    votes: {
      cavern: vampireZ?.votes_Cavern || 0,
      church: vampireZ?.votes_Church || 0,
      erias: vampireZ?.votes_Erias || 0,
      pyramids: vampireZ?.votes_Pyramids || 0,
      village: vampireZ?.votes_Village || 0,
    },
  };
};

const formatWoolwars = (woolGames: any) => {
  const getEXPReq = (level: number) => {
    const progress = level % 100;
    if (progress > 4) return 5000;
    const levels = [level >= 100 ? 5000 : 0, 1000, 2000, 3000, 4000];
    return levels[progress];
  };

  const getWoolwarsStar = (EXP: number) => {
    const prestiges = Math.floor(EXP / 490_000);
    var level = prestiges * 100;
    var remainingEXP = EXP - prestiges * 490_000;
    for (let i = 0; i < 5; ++i) {
      const EXPForNextLevel = getEXPReq(i);
      if (remainingEXP < EXPForNextLevel) break;
      level++;
      remainingEXP -= EXPForNextLevel;
    }
    return level + remainingEXP / getEXPReq(level + 1);
  };

  return {
    EXP: woolGames?.progression?.experience || 0,
    level: getWoolwarsStar(woolGames?.progression?.experience || 0),
    coins: woolGames?.coins || 0,
    gamesPlayed: woolGames?.wool_wars?.stats?.games_played || 0,
    wins: woolGames?.wool_wars?.stats?.wins || 0,
    losses: (woolGames?.wool_wars?.stats?.games_played || 0) - (woolGames?.wool_wars?.stats?.wins || 0),
    WLR: getRatio(woolGames?.wool_wars?.stats?.wins || 0, (woolGames?.wool_wars?.stats?.games_played || 0) - (woolGames?.wool_wars?.stats?.wins || 0)),
    kills: woolGames?.wool_wars?.stats?.kills || 0,
    assists: woolGames?.wool_wars?.stats?.assists || 0,
    deaths: woolGames?.wool_wars?.stats?.deaths || 0,
    KDR: getRatio(woolGames?.wool_wars?.stats?.kills || 0, woolGames?.wool_wars?.stats?.deaths || 0),
    blocksBroken: woolGames?.wool_wars?.stats?.blocks_broken || 0,
    woolPlaced: woolGames?.wool_wars?.stats?.wool_placed || 0,
    powerupsCollected: woolGames?.wool_wars?.stats?.powerups_gotten || 0,
  };
};

export const formatPlayer = async (Player: any) => {
  const player: any = {};

  player["UUID"] = Player.uuid;
  player["username"] = Player.displayname;
  player["rank"] = parseRank(Player.rank, Player.packageRank, Player.newPackageRank, Player.monthlyPackageRank, Player.prefix);
  player["plusColor"] = parsePlusColor(Player.rankPlusColor, player["rank"]);
  player["plusPlusColor"] = parsePlusPlusColor(Player.monthlyRankColor, player["rank"]);
  player["EXP"] = Player?.networkExp || 0;
  player["level"] = (Math.sqrt(player["EXP"] + 15312.5) - 125 / Math.sqrt(2)) / (25 * Math.sqrt(2));
  player["karma"] = Player?.karma || 0;
  player["achievementPoints"] = Player?.achievementPoints || 0;
  player["questsCompleted"] = 0;
  player["challengesCompleted"] = 0;
  player["online"] = null;
  if (Player.lastLogout && Player.lastLogin) {
    if (Player.lastLogout < Player.lastLogin) {
      player["online"] = true;
    } else {
      player["online"] = false;
    }
  }
  player["firstLogin"] = Player?.firstLogin ? Math.floor(Player.firstLogin / 1000) : null;
  player["lastLogin"] = Player?.lastLogin ? Math.floor(Player.lastLogin / 1000) : null;
  player["lastLogout"] = Player?.lastLogout ? Math.floor(Player.lastLogout / 1000) : null;
  player["language"] = Player?.userLanguage || "ENGLISH";
  player["chatChannel"] = Player?.channel || "ALL";
  player["giftsSent"] = Player?.giftingMeta?.realBundlesGiven || 0;
  player["giftsReceived"] = Player?.giftingMeta?.realBundlesReceived || 0;
  player["ranksGifted"] = Player?.giftingMeta?.ranksGiven || 0;

  for (const quests in Player?.quests || {}) {
    player["questsCompleted"] += Player?.quests[quests]?.completions?.length || 0;
  }

  player["challengesCompleted"] = Object.values(Player?.challenges?.["all_time"] || {}).reduce((a: any, b: any) => a + b, 0);

  var winstreakHidden = false;

  if (Player?.stats?.Bedwars?.games_played_bedwars !== undefined && Player?.stats?.Bedwars?.winstreak === undefined) winstreakHidden = true;

  player["APISettings"] = {
    onlineStatusHidden: !Player?.lastLogin,
    winstreaksHidden: winstreakHidden,
  };

  player["rewards"] = {
    rewardStreak: Player?.rewardScore || 0,
    highestRewardStreak: Player?.rewardHighScore || 0,
    claimedTotal: Player?.totalRewards || 0,
    claimedDaily: Player?.totalDailyRewards || 0,
    rewardTokens: Player?.adsense_tokens || 0,
  };

  player["socialMedia"] = {
    HYPIXEL: Player?.socialMedia?.links?.HYPIXEL?.toLowerCase() || null,
    DISCORD: Player?.socialMedia?.links?.DISCORD?.toLowerCase() || null,
    YOUTUBE: Player?.socialMedia?.links?.YOUTUBE?.toLowerCase() || null,
    TWITCH: Player?.socialMedia?.links?.TWITCH?.toLowerCase() || null,
    TWITTER: Player?.socialMedia?.links?.TWITTER?.toLowerCase() || null,
    INSTAGRAM: Player?.socialMedia?.links?.INSTAGRAM?.toLowerCase() || null,
    TIKTOK: Player?.socialMedia?.links?.TIKTOK?.toLowerCase() || null,
  };

  player["stats"] = {
    Bedwars: formatBedwars(Player?.stats?.Bedwars),
    Skywars: formatSkywars(Player?.stats?.SkyWars),
    Duels: formatDuels(Player?.stats?.Duels),
    Skyblock: formatSkyblock(Player?.stats?.SkyBlock),
    Arcade: formatArcade(Player?.stats?.Arcade),
    Arena: formatArena(Player?.stats?.Arena),
    Warlords: formatWarlords(Player?.stats?.Battleground),
    BuildBattle: formatBuildBattle(Player?.stats?.BuildBattle),
    TKR: formatTKR(Player?.stats?.GingerBread),
    MurderMystery: formatMurderMystery(Player?.stats?.MurderMystery),
    Pit: await formatPit(Player?.stats?.Pit),
    TNT: formatTNT(Player?.stats?.TNTGAMES),
    Blitz: formatBlitz(Player?.stats?.HungerGames),
    CvC: formatCopsAndCrims(Player?.stats?.MCGO),
    Paintball: formatPaintball(Player?.stats?.Paintball),
    Quake: formatQuake(Player?.stats?.Quake),
    SpeedUHC: formatSpeedUHC(Player?.stats?.SpeedUHC),
    Smash: formatSmash(Player?.stats?.SuperSmash),
    Walls: formatWalls(Player?.stats?.Walls),
    MegaWalls: formatMegaWalls(Player?.stats?.["Walls3"]),
    VampireZ: formatVampireZ(Player?.stats?.VampireZ),
    Woolwars: formatWoolwars(Player?.stats?.WoolGames),
  };

  return player;
};
