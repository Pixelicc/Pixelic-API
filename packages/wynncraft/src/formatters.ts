import { requestUUID } from "@pixelic/mojang";
import { formatUUID } from "@pixelic/utils";

export const formatPlayer = (player: any) => {
  const characters: any = {};
  for (const [UUID, character] of Object.entries((player?.characters || {}) as { [key: string]: any })) {
    const parseProfessions = (professions: string[]) => {
      const formattedProfessions: any = {};
      for (const profession of professions) {
        formattedProfessions[profession] = {
          level: character?.professions?.[profession]?.level || 0,
          levelPercent: character?.professions?.[profession]?.xpPercent || 0,
        };
      }
      return formattedProfessions;
    };

    characters[formatUUID(UUID)] = {
      class: character.type.toUpperCase(),
      nick: character.nickname,
      level: character?.level || 0,
      totalLevels: character?.totalLevels || 0,
      EXP: character?.xp || 0,
      levelPercent: character?.xpPercent || 0,
      wars: character?.wars || 0,
      mobsKilled: character?.mobsKilled || 0,
      chestsFound: character?.chestsFound || 0,
      blocksWalked: character?.blocksWalked || 0,
      playtime: character?.playtime || 0,
      logins: character?.logins || 0,
      deaths: character?.deaths || 0,
      discoveries: character?.discoveries || 0,
      pvp: {
        kills: character?.pvp?.kills || 0,
        deaths: character?.pvp?.deaths || 0,
      },
      gamemodes: character?.gamemode?.map((gamemode: string) => gamemode.toUpperCase()) || [],
      skillPoints: character?.skillPoints || {},
      professions: parseProfessions(["fishing", "woodcutting", "mining", "farming", "scribing", "jeweling", "alchemism", "cooking", "weaponsmithing", "tailoring", "woodworking", "armouring"]),
      dungeons: {
        total: character?.dungeons?.total || 0,
        list: character?.dungeons?.list || {},
      },
      raids: {
        total: character?.raids?.total || 0,
        list: character?.raids?.list || {},
      },
      questsCompleted: character?.quests?.length || 0,
      quests: character?.quests || [],
    };
  }
  return {
    UUID: formatUUID(player.uuid),
    username: player.username,
    playtime: player?.playtime >= 0 ? player?.playtime : null,
    firstLogin: player?.firstJoin ? Math.floor(new Date(player?.firstJoin).valueOf() / 1000) : null,
    lastLogin: player?.lastJoin ? Math.floor(new Date(player?.lastJoin).valueOf() / 1000) : null,
    online: player?.online || null,
    server: player?.server || null,
    rank: player?.rank === "Administrator" ? "ADMIN" : player?.rank?.toUpperCase() || "PLAYER",
    purchasedRank: player?.supportRank === "vipplus" ? "VIP_PLUS" : player?.supportRank?.toUpperCase() || null,
    global: {
      wars: player?.globalData?.wars || 0,
      totalLevels: player?.globalData?.totalLevels || 0,
      mobsKilled: player?.globalData?.killedMobs || 0,
      chestsFound: player?.globalData?.chestsFound || 0,
      dungeons: {
        total: player?.globalData?.dungeons?.total || 0,
        list: player?.globalData?.dungeons?.list || {},
      },
      raids: {
        total: player?.globalData?.raids?.total || 0,
        list: player?.globalData?.raids?.list || {},
      },
      questsCompleted: player?.globalData?.completedQuests || 0,
      pvp: {
        kills: player?.globalData?.pvp?.kills || 0,
        deaths: player?.globalData?.pvp?.deaths || 0,
      },
    },
    characters,
    rankings: player?.ranking || {},
    guild: player?.guild
      ? {
          name: player.guild.name,
          prefix: player.guild.prefix,
          rank: player.guild.rank,
        }
      : null,
    publicProfile: player?.publicProfile || false,
  };
};

export const formatGuild = (guild: any) => {
  const members = [];

  for (const rank of ["owner", "chief", "strategist", "captain", "recruiter", "recruit"]) {
    for (const [username, data] of Object.entries(guild.members[rank] as [string, any])) {
      members.push({
        username,
        UUID: formatUUID(data.uuid),
        rank: rank.toUpperCase(),
        online: data?.online || null,
        server: data?.server || null,
        contributed: data?.contributed || 0,
        joined: data?.joined ? Math.floor(new Date(data?.joined).valueOf() / 1000) : null,
      });
    }
  }
  return {
    name: guild.name,
    prefix: guild?.prefix || null,
    onlineMembers: guild?.online || 0,
    members: members,
    levelPercent: guild?.xpPercent || 0,
    level: guild?.level || 0,
    created: guild?.created ? Math.floor(new Date(guild?.created).valueOf() / 1000) : null,
    territories: guild?.territories || 0,
    wars: guild?.wars || 0,
    banner: guild?.banner || null,
  };
};

export const formatServerList = async (data: any, { UUIDs }: { UUIDs?: boolean }) => {
  const parsedData: any = {
    playercount: data.total,
    servercount: 0,
    servers: {},
  };

  for (const [player, server] of Object.entries(data.players as { [key: string]: string })) {
    if (parsedData.servers[server] === undefined) {
      parsedData.servers[server] = {
        playercount: 0,
        players: [],
      };
      parsedData.servercount++;
    }
    parsedData.servers[server].playercount++;

    if (UUIDs) {
      parsedData.servers[server].players.push({
        UUID: (await requestUUID(player))?.data || null,
        username: player,
      });
    } else {
      parsedData.servers[server].players.push(player);
    }
  }
  for (const server in parsedData.servers) {
    if (UUIDs) {
      parsedData.servers[server].players = parsedData.servers[server].players.sort((a: { UUID: string; username: string }, b: { UUID: string; username: string }) => a.username.localeCompare(b.username, undefined, { sensitivity: "base" }));
    } else {
      parsedData.servers[server].players = parsedData.servers[server].players.sort();
    }
  }
  return parsedData as {
    playercount: number;
    servercount: number;
    servers: {
      [key: string]: { playercount: number; players: string[] | { UUID: string | null; username: string }[] };
    };
  };
};

export const formatTerritoryList = (territories: any) => {
  const parsedTerritories: any = {};
  for (const territory in territories) {
    parsedTerritories[territory] = {
      guild: territories[territory]?.guild ? territories[territory].guild : null,
      acquired: territories[territory]?.acquired ? Math.floor(new Date(territories[territory].acquired).valueOf() / 1000) : null,
      location: territories[territory].location,
    };
  }
  return parsedTerritories;
};
