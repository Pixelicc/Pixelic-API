import nbt from "prismarine-nbt";
import util from "util";
// @ts-ignore
import minecraftItems from "minecraft-items";
import { getRatio, formatUUID, decodeNBT } from "@pixelic/utils";
import { getSkyblockItems } from "./index.js";
import { ISOString } from "@pixelic/types";

const parseNbt = util.promisify(nbt.parse);

const addObjects = (objects: { [key: string]: number | object }[]): { [key: string]: number | object } => {
  const result: { [key: string]: any } = {};

  const addNestedObjects = (source: { [key: string]: number }, target: { [key: string]: number }) => {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (target[key] === undefined) {
          target[key] = source[key];
        } else {
          if (key === "winstreak") {
            if (target[key] <= source[key]) {
              target[key] = source[key];
            }
          } else {
            target[key] += source[key];
          }
        }
      }
    }
  };

  for (const obj of objects) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object") {
          if (!result[key]) {
            // @ts-ignore
            result[key] = {};
          }
          // @ts-ignore
          addNestedObjects(obj[key], result[key]);
        } else {
          if (result[key] === undefined) {
            result[key] = obj[key];
          } else {
            if (key === "winstreak") {
              if (result[key] <= obj[key]) {
                result[key] = obj[key];
              }
            } else {
              // @ts-ignore
              result[key] += obj[key];
            }
          }
        }
      }
    }
  }

  const calcNestedObjects = (res: { [key: string]: any }) => {
    for (const key in res) {
      if (res.hasOwnProperty(key)) {
        if (typeof res[key] === "object") {
          res[key] = calcNestedObjects(res[key]);
        } else {
          if (key === "WLR") {
            res[key] = getRatio(res["wins"], res["losses"]);
          } else if (key === "FKDR") {
            res[key] = getRatio(res["finalKills"], res["finalDeaths"]);
          } else if (key === "KDR") {
            res[key] = getRatio(res["kills"], res["deaths"]);
          } else if (key === "BBLR") {
            res[key] = getRatio(res["bedsBroken"], res["bedsLost"]);
          }
        }
      }
    }

    return res;
  };

  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      if (typeof result[key] === "object") {
      } else {
        if (key === "WLR") {
          result[key] = getRatio(result["wins"], result["losses"]);
        } else if (key === "FKDR") {
          result[key] = getRatio(result["finalKills"], result["finalDeaths"]);
        } else if (key === "KDR") {
          result[key] = getRatio(result["kills"], result["deaths"]);
        } else if (key === "BBLR") {
          result[key] = getRatio(result["bedsBroken"], result["bedsLost"]);
        }
      }
    }
  }

  return result;
};

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

const parsePlusColor = (plusColor: string | null, rank: string | null) => {
  if (plusColor === undefined || plusColor === null) {
    if (rank === "MVP_PLUS" || rank === "MVP_PLUS_PLUS") {
      return "RED";
    } else {
      return null;
    }
  }
  return plusColor;
};

const parsePlusPlusColor = (plusPlusColor: string | null, rank: string | null) => {
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

  const getStat = (prefix: string, stat: string) => bedwars?.[`${prefix}${stat}`] || 0;

  const getMode = (prefix: string) => {
    return {
      wins: getStat(prefix, "wins_bedwars"),
      winstreak: getStat(prefix, "winstreak"),
      losses: getStat(prefix, "losses_bedwars"),
      WLR: getRatio(getStat(prefix, "wins_bedwars"), getStat(prefix, "losses_bedwars")),
      finalKills: getStat(prefix, "final_kills_bedwars"),
      finalDeaths: getStat(prefix, "final_deaths_bedwars"),
      FKDR: getRatio(getStat(prefix, "final_kills_bedwars"), getStat(prefix, "final_deaths_bedwars")),
      kills: getStat(prefix, "kills_bedwars"),
      deaths: getStat(prefix, "deaths_bedwars"),
      KDR: getRatio(getStat(prefix, "kills_bedwars"), getStat(prefix, "deaths_bedwars")),
      bedsBroken: getStat(prefix, "beds_broken_bedwars"),
      bedsLost: getStat(prefix, "beds_lost_bedwars"),
      BBLR: getRatio(getStat(prefix, "beds_broken_bedwars"), getStat(prefix, "beds_lost_bedwars")),
      gamesPlayed: getStat(prefix, "games_played_bedwars"),
      resourcesCollected: {
        iron: getStat(prefix, "iron_resources_collected_bedwars"),
        gold: getStat(prefix, "gold_resources_collected_bedwars"),
        diamond: getStat(prefix, "diamond_resources_collected_bedwars"),
        emerald: getStat(prefix, "emerald_resources_collected_bedwars"),
      },
    };
  };

  const formattedBedwars: any = {
    EXP: bedwars?.Experience || 0,
    level: getLevelForEXP(bedwars?.Experience || 0),
    coins: bedwars?.coins || 0,
    chests: bedwars?.bedwars_boxes || 0,
    quickbuy: ["wool", "stone_sword", "chainmail_boots", null, "bow", "speed_ii_potion_(45_seconds)", "tnt", "oak_wood_planks", "iron_sword", "iron_boots", "shears", "arrow", "jump_v_potion_(45_seconds)", "water_bucket", null, null, null, null, null, null, null],
    preferedSlots: [null, null, null, null, null, null, null, null, null],
    overall: getMode(""),
    cores: addObjects([getMode("eight_one_"), getMode("eight_two_"), getMode("four_three_"), getMode("four_four_")]),
    solo: getMode("eight_one_"),
    doubles: getMode("eight_two_"),
    threes: getMode("four_three_"),
    fours: getMode("four_four_"),
    "4v4": getMode("two_four_"),
    dreams: {
      lucky: {
        overall: addObjects([getMode("eight_two_lucky_"), getMode("four_four_lucky_")]),
        doubles: getMode("eight_two_lucky_"),
        fours: getMode("four_four_lucky_"),
      },
      rush: {
        overall: addObjects([getMode("eight_two_rush_"), getMode("four_four_rush_")]),
        doubles: getMode("eight_two_rush_"),
        fours: getMode("four_four_rush_"),
      },
      ultimate: {
        overall: addObjects([getMode("eight_two_ultimate_"), getMode("four_four_ultimate_")]),
        doubles: getMode("eight_two_ultimate_"),
        fours: getMode("four_four_ultimate_"),
      },
      armed: {
        overall: addObjects([getMode("eight_two_armed_"), getMode("four_four_armed_")]),
        doubles: getMode("eight_two_armed_"),
        fours: getMode("four_four_armed_"),
      },
      voidless: {
        overall: addObjects([getMode("eight_two_voidless_"), getMode("four_four_voidless_")]),
        doubles: getMode("eight_two_voidless_"),
        fours: getMode("four_four_voidless_"),
      },
      swap: {
        overall: addObjects([getMode("eight_two_swap_"), getMode("four_four_swap_")]),
        doubles: getMode("eight_two_swap_"),
        fours: getMode("four_four_swap_"),
      },
      castle: getMode("castle_"),
    },
    practice: {
      selected: bedwars?.practice?.selected || null,
      bridging: {
        successes: bedwars?.practice?.bridging?.successful_attempts || 0,
        fails: bedwars?.practice?.bridging?.failed_attempts || 0,
        SFR: getRatio(bedwars?.practice?.bridging?.successful_attempts || 0, bedwars?.practice?.bridging?.failed_attempts || 0),
        blocksPlaced: bedwars?.practice?.bridging?.blocks_placed || 0,
      },
      MLG: {
        successes: bedwars?.practice?.mlg?.successful_attempts || 0,
        fails: bedwars?.practice?.mlg?.failed_attempts || 0,
        SFR: getRatio(bedwars?.practice?.mlg?.successful_attempts || 0, bedwars?.practice?.mlg?.failed_attempts || 0),
        blocksPlaced: bedwars?.practice?.mlg?.blocks_placed || 0,
      },
      fireballJumping: {
        successes: bedwars?.practice?.fireball_jumping?.successful_attempts || 0,
        fails: bedwars?.practice?.fireball_jumping?.failed_attempts || 0,
        SFR: getRatio(bedwars?.practice?.fireball_jumping?.successful_attempts || 0, bedwars?.practice?.fireball_jumping?.failed_attempts || 0),
        blocksPlaced: bedwars?.practice?.fireball_jumping?.blocks_placed || 0,
      },
      pearlClutching: {
        successes: bedwars?.practice?.pearl_clutching?.successful_attempts || 0,
        fails: bedwars?.practice?.pearl_clutching?.failed_attempts || 0,
        SFR: getRatio(bedwars?.practice?.pearl_clutching?.successful_attempts || 0, bedwars?.practice?.pearl_clutching?.failed_attempts || 0),
      },
    },
    challengesCompleted: bedwars?.total_challenges_completed || 0,
    uniqueChallengesCompleted: bedwars?.bw_unique_challenges_completed || 0,
    challenges: {
      renegade: bedwars?.bw_challenge_no_team_upgrades || 0,
      warmonger: bedwars?.bw_challenge_no_utilities || 0,
      selfish: bedwars?.bw_challenge_selfish || 0,
      minimumWage: bedwars?.bw_challenge_slow_generator || 0,
      assassin: bedwars?.bw_challenge_assassin || 0,
      regularShopper: bedwars?.bw_challenge_reset_armor || 0,
      invisibleShop: bedwars?.bw_challenge_invisible_shop || 0,
      collector: bedwars?.bw_challenge_collector || 0,
      woodworker: bedwars?.bw_challenge_woodworker || 0,
      bridgingForDummies: bedwars?.bw_challenge_sponge || 0,
      toxicRain: bedwars?.bw_challenge_toxic_rain || 0,
      defuser: bedwars?.bw_challenge_defuser || 0,
      lazyMiner: bedwars?.bw_challenge_mining_fatigue || 0,
      ultimateUHC: bedwars?.bw_challenge_no_healing || 0,
      sleightOfHand: bedwars?.bw_challenge_hotbar || 0,
      weightedItems: bedwars?.bw_challenge_weighted_items || 0,
      socialDistancing: bedwars?.bw_challenge_knockback_stick_only || 0,
      swordless: bedwars?.bw_challenge_no_swords || 0,
      marksman: bedwars?.bw_challenge_archer_only || 0,
      patriot: bedwars?.bw_challenge_patriot || 0,
      stamina: bedwars?.bw_challenge_stamina || 0,
      oldMan: bedwars?.bw_challenge_no_sprint || 0,
      cappedResources: bedwars?.bw_challenge_capped_resources || 0,
      redLightGreenLight: bedwars?.bw_challenge_stop_light || 0,
      slowReflexes: bedwars?.bw_challenge_delayed_hitting || 0,
      pacifist: bedwars?.bw_challenge_no_hitting || 0,
      masterAssassin: bedwars?.bw_challenge_master_assassin || 0,
      standingTall: bedwars?.bw_challenge_no_shift || 0,
      protectThePresident: bedwars?.bw_challenge_protect_the_president || 0,
      cantTouchThis: bedwars?.bw_challenge_cant_touch_this || 0,
    },
    slumber: {
      bag: bedwars?.slumber?.bag_type || null,
      unlockedHotel: bedwars?.slumber?.tickets_requirement_met || false,
      tickets: bedwars?.slumber?.tickets || 0,
      ticketsEarned: bedwars?.slumber?.total_tickets_earned || 0,
    },
  };

  if (bedwars?.["favourites_2"]) {
    formattedBedwars["quickbuy"] = bedwars["favourites_2"].toUpperCase().split(",");
    for (const slot in formattedBedwars["quickbuy"]) {
      if (formattedBedwars["quickbuy"][slot] === "NULL") formattedBedwars["quickbuy"][slot] = null;
    }
  }

  if (bedwars?.["favorite_slots"]) {
    formattedBedwars["preferedSlots"] = bedwars["favorite_slots"].toUpperCase().split(",");
    for (const slot in formattedBedwars["preferedSlots"]) {
      if (formattedBedwars["preferedSlots"][slot] === "NULL") formattedBedwars["preferedSlots"][slot] = null;
    }
  }

  return formattedBedwars;
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

  const getStat = (prefix: string, stat: string) => skywars?.[`${stat}${prefix}`] || 0;

  const getMode = (prefix: string) => {
    return {
      wins: getStat(prefix, "wins"),
      losses: getStat(prefix, "losses"),
      WLR: getRatio(getStat(prefix, "wins"), getStat(prefix, "losses")),
      kills: getStat(prefix, "kills"),
      deaths: getStat(prefix, "deaths"),
      KDR: getRatio(getStat(prefix, "kills"), getStat(prefix, "deaths")),
      assists: getStat(prefix, "assists"),
      arrowsShot: getStat(prefix, "arrows_shot"),
      arrowsHit: getStat(prefix, "arrows_hit"),
      AHMR: getRatio(getStat(prefix, "arrows_shot"), getStat(prefix, "arrows_hit")),
      timePlayed: getStat(prefix, "time_played"),
    };
  };

  return {
    EXP: skywars?.skywars_experience || 0,
    level: getLevelForEXP(skywars?.skywars_experience || 0),
    coins: skywars?.coins || 0,
    tokens: skywars?.cosmetic_tokens || 0,
    souls: skywars?.souls || 0,
    chests: skywars?.skywars_chests || 0,
    totalHeads: skywars?.heads || 0,
    heads: {
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
    },
    overall: {
      ...getMode(""),
      gamesPlayed: skywars?.games_played_skywars || 0,
    },
    solo: getMode("_solo"),
    doubles: getMode("_team"),
  };
};

const formatDuels = (duels: any) => {
  const getStat = (prefix: string, stat: string) => duels?.[`${prefix}_${stat}`] || 0;

  const getMode = (prefix: string) => {
    return {
      wins: getStat(prefix, "wins"),
      winstreak: duels?.[`current_winstreak_mode_${prefix}`] || 0,
      losses: getStat(prefix, "losses"),
      WLR: getRatio(getStat(prefix, "wins"), getStat(prefix, "losses")),
      kills: getStat(prefix, "kills"),
      deaths: getStat(prefix, "deaths"),
      KDR: getRatio(getStat(prefix, "kills"), getStat(prefix, "deaths")),
      gamesPlayed: duels?.[`${prefix}_rounds_played`] || 0,
    };
  };

  return {
    coins: duels?.coins || 0,
    chests: duels?.duels_chests || 0,
    activeTitle: duels?.active_cosmetictitle || null,
    overall: {
      gamesPlayed: duels?.games_played_duels || 0,
      winstreak: duels?.current_winstreak || 0,
      wins: duels?.wins || 0,
      losses: duels?.losses || 0,
      WLR: getRatio(duels?.wins || 0, duels?.losses || 0),
      kills: duels?.kills || 0,
      deaths: duels?.deaths || 0,
      KDR: getRatio(duels?.kills || 0, duels?.deaths || 0),
    },
    arena: getMode("duel_arena"),
    blitz: getMode("blitz_duel"),
    bow: getMode("bow_duel"),
    bowspleef: getMode("bowspleef_duel"),
    boxing: getMode("boxing_duel"),
    bridge: {
      overall: addObjects([getMode("bridge_duel"), getMode("bridge_doubles"), getMode("bridge_threes"), getMode("bridge_fours"), getMode("bridge_2v2v2v2"), getMode("bridge_3v3v3v3"), getMode("capture_threes")]),
      solo: getMode("bridge_duel"),
      doubles: getMode("bridge_doubles"),
      threes: getMode("bridge_threes"),
      fours: getMode("bridge_fours"),
      "2v2v2v2": getMode("bridge_2v2v2v2"),
      "3v3v3v3": getMode("bridge_3v3v3v3"),
      CTF: getMode("capture_threes"),
    },
    classic: getMode("classic_duel"),
    combo: getMode("combo_duel"),
    megawalls: {
      overall: addObjects([getMode("mw_duel"), getMode("mw_doubles")]),
      solo: getMode("mw_duel"),
      doubles: getMode("mw_doubles"),
    },
    noDebuff: getMode("potion_duel"),
    op: {
      overall: addObjects([getMode("op_duel"), getMode("op_doubles")]),
      solo: getMode("op_duel"),
      doubles: getMode("op_doubles"),
    },
    parkour: getMode("parkour_eight"),
    skywars: {
      overall: addObjects([getMode("sw_duel"), getMode("sw_doubles")]),
      solo: getMode("sw_duel"),
      doubles: getMode("sw_doubles"),
    },
    sumo: getMode("sumo_duel"),
    uhc: {
      overall: addObjects([getMode("uhc_duel"), getMode("uhc_doubles"), getMode("uhc_four"), getMode("uhc_meetup")]),
      solo: getMode("uhc_duel"),
      doubles: getMode("uhc_doubles"),
      fours: getMode("uhc_four"),
      deathmatch: getMode("uhc_meetup"),
    },
  };
};

const formatSkyblock = (skyblock: any) => {
  const profiles = [];
  for (const profile of Object.keys(skyblock?.profiles || {})) {
    profiles.push({ UUID: formatUUID(skyblock.profiles[profile]["profile_id"]), name: skyblock.profiles[profile]["cute_name"] });
  }
  return { profiles };
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
  const getStat = (prefix: string, stat: string) => arena?.[`${stat}_${prefix}`] || 0;

  const getMode = (prefix: string) => {
    return {
      wins: getStat(prefix, "wins"),
      losses: getStat(prefix, "losses"),
      WLR: getRatio(getStat(prefix, "wins"), getStat(prefix, "losses")),
      kills: getStat(prefix, "kills"),
      deaths: getStat(prefix, "deaths"),
      KDR: getRatio(getStat(prefix, "kills"), getStat(prefix, "deaths")),
      damage: getStat(prefix, "damage"),
      healed: getStat(prefix, "healed"),
      gamesPlayed: getStat(prefix, "games"),
    };
  };

  return {
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
    overall: addObjects([getMode("1v1"), getMode("2v2"), getMode("4v4")]),
    solo: getMode("1v1"),
    doubles: getMode("2v2"),
    "4v4": getMode("4v4"),
  };
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
  // Credits to Slothpixel for fromEntries(), pickKeys() and themeRating
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
    themeRatings: themeRatings || {},
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

const formatCvC = (MCGO: any) => {
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
      opportunity: walls?.opportunity || 0,
      shoutCount: walls?.shout_count || 0,
      swift: walls?.swift || 0,
      tenacity: walls?.tenacity || 0,
      vampirism: walls?.vampirism || 0,
      vitality: walls?.vitality || 0,
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

export const formatPlayer = async (player: any) => {
  const rank = parseRank(player.rank, player.packageRank, player.newPackageRank, player.monthlyPackageRank, player.prefix);
  var online = null;
  if (player?.lastLogout && player?.lastLogin) {
    if (player.lastLogout < player.lastLogin) {
      online = true;
    } else {
      online = false;
    }
  }

  var questsCompleted = 0;
  type questObject = { completions: { time: number }[]; active: { objectives: { [key: string]: number }; started: number } }[];
  if (player?.quests) {
    for (const quest of Object.values(player.quests) as questObject) {
      questsCompleted += quest?.completions?.length || 0;
    }
  }

  return {
    UUID: player.uuid,
    username: player.displayname,
    rank: rank,
    plusColor: parsePlusColor(player.rankPlusColor, rank),
    plusPlusColor: parsePlusPlusColor(player.monthlyRankColor, rank),
    EXP: (player?.networkExp || 0) >= 0 ? player?.networkExp || 0 : 0,
    level: (Math.sqrt((player?.networkExp || 0) + 15312.5) - 125 / Math.sqrt(2)) / (25 * Math.sqrt(2)),
    karma: player?.karma || 0,
    achievementPoints: player?.achievementPoints || 0,
    questsCompleted: questsCompleted,
    challengesCompleted: Object.values(player?.challenges?.["all_time"] || {}).reduce((a: any, b: any) => a + b, 0),
    online: online,
    firstLogin: player?.firstLogin ? Math.floor(player.firstLogin / 1000) : null,
    lastLogin: player?.lastLogin ? Math.floor(player.lastLogin / 1000) : null,
    lastLogout: player?.lastLogout ? Math.floor(player.lastLogout / 1000) : null,
    lastModePlayed: player?.mostRecentGameType || null,
    language: player?.userLanguage || "ENGLISH",
    chatChannel: player?.channel || "ALL",
    ranksGifted: player?.giftingMeta?.ranksGiven || 0,
    APISettings: {
      onlineStatus: player?.lastLogin !== undefined,
      winstreaks: !(player?.stats?.Bedwars?.games_played_bedwars !== undefined && player?.stats?.Bedwars?.winstreak === undefined),
    },
    rewards: {
      streak: player?.rewardScore || 0,
      highestStreak: player?.rewardHighScore || 0,
      claimedTotal: player?.totalRewards || 0,
      claimedDaily: player?.totalDailyRewards || 0,
      tokens: player?.adsense_tokens || 0,
    },
    socialMedia: {
      HYPIXEL: player?.socialMedia?.links?.HYPIXEL || null,
      DISCORD: player?.socialMedia?.links?.DISCORD || null,
      YOUTUBE: player?.socialMedia?.links?.YOUTUBE || null,
      TWITCH: player?.socialMedia?.links?.TWITCH || null,
      TWITTER: player?.socialMedia?.links?.TWITTER || null,
      INSTAGRAM: player?.socialMedia?.links?.INSTAGRAM || null,
      TIKTOK: player?.socialMedia?.links?.TIKTOK || null,
    },
    tourney: {
      tributes: player?.tourney?.total_tributes || 0,
      /**
       * TODO: Add individual tournament stats
       */
    },
    stats: {
      Bedwars: formatBedwars(player?.stats?.Bedwars),
      Skywars: formatSkywars(player?.stats?.SkyWars),
      Duels: formatDuels(player?.stats?.Duels),
      Skyblock: formatSkyblock(player?.stats?.SkyBlock),
      Arcade: formatArcade(player?.stats?.Arcade),
      Arena: formatArena(player?.stats?.Arena),
      Warlords: formatWarlords(player?.stats?.Battleground),
      BuildBattle: formatBuildBattle(player?.stats?.BuildBattle),
      TKR: formatTKR(player?.stats?.GingerBread),
      MurderMystery: formatMurderMystery(player?.stats?.MurderMystery),
      Pit: await formatPit(player?.stats?.Pit),
      TNT: formatTNT(player?.stats?.TNTGAMES),
      Blitz: formatBlitz(player?.stats?.HungerGames),
      CvC: formatCvC(player?.stats?.MCGO),
      Paintball: formatPaintball(player?.stats?.Paintball),
      Quake: formatQuake(player?.stats?.Quake),
      SpeedUHC: formatSpeedUHC(player?.stats?.SpeedUHC),
      Smash: formatSmash(player?.stats?.SuperSmash),
      Walls: formatWalls(player?.stats?.Walls),
      MegaWalls: formatMegaWalls(player?.stats?.["Walls3"]),
      VampireZ: formatVampireZ(player?.stats?.VampireZ),
      Woolwars: formatWoolwars(player?.stats?.WoolGames),
    },
  };
};

export const formatGuild = (guild: any) => {
  const getLevel = (EXP: number) => {
    const reqs = [100000, 150000, 250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 2500000, 2500000, 2500000, 2500000, 3000000];
    var level = 0;
    for (var i = 0; i <= 1000; i++) {
      var req = 0;
      if (i >= reqs.length) {
        req = reqs[reqs.length - 1];
      } else {
        req = reqs[i];
      }
      if (EXP - req < 0) return ((level + EXP / req) * 100) / 100;
      level += 1;
      EXP -= req;
    }
    return 1000;
  };

  const parseCappedEXPHistory = (EXPHistory: { [key: string]: number }) => {
    const cappedEXPHistory: { [key: string]: number } = {};
    for (const day in EXPHistory) {
      if (EXPHistory[day] <= 200000) cappedEXPHistory[day] = EXPHistory[day];
      else if (EXPHistory[day] <= 250000) cappedEXPHistory[day] = Math.floor(200000 + (EXPHistory[day] - 200000) * 0.1);
      else cappedEXPHistory[day] = Math.floor(200000 + 5000 + (EXPHistory[day] - 250000) * 0.03);
    }
    return cappedEXPHistory;
  };

  const ranks = [];
  if (guild?.ranks) {
    for (const rank of guild.ranks.sort((a: any, b: any) => parseFloat(b.priority) - parseFloat(a.priority))) {
      ranks.push({
        name: rank.name,
        tag: rank.tag,
        default: rank.default,
        created: rank?.created ? Math.floor(rank.created / 1000) : null,
        priority: rank.priority,
      });
    }
  }

  const members = [];
  var memberCount = 0;
  const EXPHistory: { [key: string]: number } = {};
  if (guild?.members) {
    for (const member of guild.members) {
      const currentMember = {
        UUID: formatUUID(member.uuid),
        rank: member.rank,
        joined: member?.joined ? Math.floor(member.joined / 1000) : null,
        questParticipation: member?.questParticipation || 0,
        weeklyEXP: Object.values((member?.expHistory || {}) as { [key: string]: number }).reduce((total, value) => total + value, 0),
        EXPHistory: member?.expHistory || {},
        mutedTill: member?.mutedTill || null,
      };
      members.push(currentMember);
      memberCount++;

      for (const day of Object.keys(currentMember.EXPHistory)) {
        if (EXPHistory[day] === undefined) EXPHistory[day] = 0;
        EXPHistory[day] += currentMember.EXPHistory[day];
      }
    }
  }

  return {
    ID: guild._id,
    created: guild?.created ? Math.floor(guild.created / 1000) : null,
    name: guild.name,
    description: guild?.description || null,
    publiclyListed: guild?.publiclyListed || false,
    tag: guild?.tag || null,
    tagColor: guild?.tagColor || null,
    EXP: guild?.exp || 0,
    weeklyEXP: Object.values(EXPHistory as { [key: ISOString["YYYY_MM_DD"]]: number }).reduce((total, value) => total + value, 0),
    cappedWeeklyEXP: Object.values(parseCappedEXPHistory(EXPHistory) as { [key: ISOString["YYYY_MM_DD"]]: number }).reduce((total, value) => total + value, 0),
    EXPHistory: EXPHistory as { [key: ISOString["YYYY_MM_DD"]]: number },
    cappedEXPHistory: parseCappedEXPHistory(EXPHistory) as { [key: ISOString["YYYY_MM_DD"]]: number },
    level: getLevel(guild?.exp || 0),
    ranks: ranks,
    memberCount: memberCount,
    members: members,
    preferredGames: guild?.preferredGames || [],
    EXPPerGame: guild?.guildExpByGameType || {},
    achievements: {
      experienceKings: guild?.achievements?.EXPERIENCE_KINGS || 0,
      winners: guild?.achievements?.WINNERS || 0,
      onlinePlayers: guild?.achievements?.ONLINE_PLAYERS || 0,
    },
  };
};

const formatSkyblockAuctionNBT = (NBT: any) => {
  const rawTier = NBT.tag.display.Lore[NBT.tag.display.Lore.length - 1].toUpperCase();
  var tier;

  if (rawTier.includes("COMMON")) tier = "COMMON";
  if (rawTier.includes("UNCOMMON")) tier = "UNCOMMON";
  if (rawTier.includes("RARE")) tier = "RARE";
  if (rawTier.includes("EPIC")) tier = "EPIC";
  if (rawTier.includes("LEGENDARY")) tier = "LEGENDARY";
  if (rawTier.includes("MYTHIC")) tier = "MYTHIC";
  if (rawTier.includes("DIVINE")) tier = "DIVINE";
  if (rawTier.includes("SPECIAL")) tier = "SPECIAL";
  if (rawTier.includes("VERY SPECIAL")) tier = "VERY_SPECIAL";
  if (rawTier.includes("SUPREME")) tier = "DIVINE"; // This should never occure as SUPREME got replaced by DIVINE
  if (rawTier.includes("ADMIN")) tier = "ADMIN"; // This should never occure

  const item: any = {
    count: NBT?.Count,
    name: NBT?.tag.display.Name,
    cleanName: NBT?.tag.display.Name.replace(/§./g, ""),
    lore: NBT?.tag?.display.Lore,
    cleanLore: [],
    color: NBT?.tag?.display.color,
    tier: tier ? tier : null,
    attributes: NBT?.tag?.ExtraAttributes,
  };

  item.lore.forEach((line: string) => {
    item.cleanLore.push(line.replace(/§./g, ""));
  });

  if (NBT?.tag?.ExtraAttributes?.id === "PET") {
    item.attributes.petInfo = JSON.parse(item.attributes.petInfo);
    item.ID = `PET_${item.attributes.petInfo.type.toUpperCase()}`;
    item.UUID = formatUUID(item?.attributes?.uuid || item.attributes.petInfo.uuid);
  } else if (NBT?.tag?.ExtraAttributes?.id === "POTION") {
    item.ID = `POTION_${String(item.attributes.potion).toUpperCase()}`;
  } else if (NBT?.tag?.ExtraAttributes?.id === "RUNE") {
    item.ID = `RUNE_${String(Object.keys(NBT.tag.ExtraAttributes.runes)[0]).toUpperCase()}`;
  } else {
    item.ID = NBT?.tag?.ExtraAttributes?.id || undefined;
    item.UUID = NBT?.tag?.ExtraAttributes?.uuid ? formatUUID(NBT.tag.ExtraAttributes.uuid) : undefined;
  }

  delete item.attributes.id;
  delete item.attributes.uuid;

  if (item?.attributes?.timestamp) {
    item.timestamp = item.attributes.timestamp ? Math.floor(new Date(Number(item.attributes.timestamp)).valueOf() / 1000) : undefined;
    if (isNaN(item.timestamp)) item.timestamp = undefined;
    delete item.attributes.timestamp;
  }
  return item;
};

export const formatSkyblockActiveAuction = async (auction: any) => {
  const NBT: any = await decodeNBT(Buffer.from(auction.item_bytes, "base64"));

  const auctionBids = [];
  for (const bid of auction.bids.sort((a: any, b: any) => a.amount - b.amount)) {
    auctionBids.push({
      bidder: bid.bidder,
      bidderProfile: bid.profile_id,
      amount: bid.amount,
      timestamp: Math.floor(bid.timestamp / 1000),
    });
  }

  return {
    UUID: auction.uuid,
    seller: auction.auctioneer,
    sellerProfile: auction.profile_id,
    coop: auction.coop.length !== 1,
    coopMembers: auction.coop.length !== 1 ? auction.coop : undefined,
    started: Math.floor(auction.start / 1000),
    ending: Math.floor(auction.end / 1000),
    category: auction.category.toUpperCase(),
    bin: auction.bin,
    startingBid: auction.starting_bid,
    highestBid: auction.bin ? auction.starting_bid : auction.highest_bid_amount,
    bids: auctionBids,
    item: formatSkyblockAuctionNBT(NBT),
  };
};

export const formatSkyblockEndedAuction = async (auction: any) => {
  const NBT: any = await decodeNBT(Buffer.from(auction.item_bytes, "base64"));

  return {
    UUID: auction.auction_id,
    seller: auction.seller,
    sellerProfile: auction.seller_profile,
    buyer: auction.buyer,
    bin: auction.bin,
    price: auction.price,
    item: formatSkyblockAuctionNBT(NBT),
    timestamp: Math.floor(auction.timestamp / 1000),
  };
};

export const formatSkyblockBazaar = async (bazaar: any, { itemInfo }: { itemInfo?: boolean }) => {
  const skyblockItems = itemInfo ? (await getSkyblockItems())?.data : {};
  const formattedData: any = {};
  for (const product of Object.keys(bazaar)) {
    formattedData[product] = {
      sellSummary: bazaar[product].sell_summary,
      buySummary: bazaar[product].buy_summary,
      quickStatus: {
        sellPrice: Number(bazaar[product].quick_status.sellPrice.toFixed(1)),
        sellVolume: bazaar[product].quick_status.sellVolume,
        sellMovingWeek: bazaar[product].quick_status.sellMovingWeek,
        sellOrders: bazaar[product].quick_status.sellOrders,
        buyPrice: Number(bazaar[product].quick_status.buyPrice.toFixed(1)),
        buyVolume: bazaar[product].quick_status.buyVolume,
        buyMovingWeek: bazaar[product].quick_status.buyMovingWeek,
        buyOrders: bazaar[product].quick_status.buyOrders,
      },
      item: itemInfo ? skyblockItems[product] : undefined,
    };
  }
  return formattedData;
};

export const formatSkyblockItems = (items: any) => {
  const formattedItems: any = {};
  for (const item of items) {
    const ID = item.id;

    let texture;
    if (item?.skin) {
      texture = JSON.parse(Buffer.from(item.skin, "base64").toString())?.textures?.SKIN?.url?.split("/")?.slice(-1)?.[0];
      delete item.skin;
    }

    if (item?.color) {
      const RGB = item.color.split(",");
      for (const i in RGB) {
        RGB[i] = Number(RGB[i]);
      }

      const decimal = (RGB[0] << 16) + (RGB[1] << 8) + RGB[2];

      item.color = {
        RGB,
        decimal,
        hex: "#" + decimal.toString(16).toUpperCase(),
      };
    }

    delete item.id;

    formattedItems[ID] = { ...item, texture };
  }
  return formattedItems;
};

export const formatSkyblockElection = (election: any) => {
  var nextMayor = null;
  var currentElection = null;
  if (election?.current) {
    nextMayor = election.current.candidates.sort((a: any, b: any) => b.votes - a.votes)[0];
    nextMayor.key = nextMayor.key.toUpperCase();

    currentElection = election.current;
    currentElection.candidates = currentElection.candidates.sort((a: any, b: any) => b.votes - a.votes);
    for (const candidate in currentElection.candidates) {
      currentElection.candidates[candidate].key = currentElection.candidates[candidate].key.toUpperCase();
    }
  }

  const lastElection: any = election.mayor.election;
  lastElection.candidates = lastElection.candidates.sort((a: any, b: any) => b.votes - a.votes);
  for (const candidate in lastElection.candidates) {
    lastElection.candidates[candidate].key = lastElection.candidates[candidate].key.toUpperCase();
  }

  return {
    currentMayor: {
      key: election.mayor.key.toUpperCase(),
      name: election.mayor.name,
      perks: election.mayor.perks,
      votes: lastElection.candidates[0].votes,
    },
    nextMayor,
    currentElection,
    lastElection,
  };
};
