import { requestUUID } from "@pixelic/mojang";
import { formatUUID } from "@pixelic/utils";

export const formatPlayer = (player: any) => {
  const characters: any = {};
  for (const character in player?.characters || {}) {
    characters[formatUUID(character)] = player.characters[character];
  }
  return {
    UUID: formatUUID(player.uuid),
    username: player.username,
    playtime: player?.playtime || null,
    firstLogin: player?.firstJoin ? Math.floor(new Date(player?.firstJoin).valueOf() / 1000) : null,
    lastLogin: player?.lastJoin ? Math.floor(new Date(player?.lastJoin).valueOf() / 1000) : null,
    online: player?.online || false,
    server: player?.server || null,
    rank: player?.rank?.toUpperCase() || "PLAYER",
    purchasedRank: player?.supportRank?.toUpperCase() || null,
    global: player?.globalData || {},
    characters,
    rankings: player?.ranking || {},
    guild: player?.guild || null,
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
        online: data?.online || false,
        contributed: data?.contributed || 0,
        contributionRank: data?.contributionRank || null,
        joined: data?.joined ? Math.floor(new Date(data?.joined).valueOf() / 1000) : null,
      });
    }
  }
  return {
    name: guild.name,
    prefix: guild?.prefix || null,
    onlineMembers: guild?.online || 0,
    members: members,
    xpPercent: guild?.xpPercent || 0,
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
        UUID: await requestUUID(player).catch(() => {
          return null;
        }),
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
