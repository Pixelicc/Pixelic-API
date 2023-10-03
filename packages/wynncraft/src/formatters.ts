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
    playtime: Math.floor((player?.meta?.playtime || 0) * 4.7),
    firstLogin: player?.meta?.firstJoin ? Math.floor(new Date(player?.meta?.firstJoin).valueOf() / 1000) : null,
    lastLogin: player?.meta?.lastJoin ? Math.floor(new Date(player?.meta?.lastJoin).valueOf() / 1000) : null,
    status: {
      online: player?.meta?.location?.online || false,
      server: player?.meta?.location?.server || null,
    },
    rank: player?.rank?.toUpperCase() || "PLAYER",
    purchasedRank: player?.meta?.tag?.value?.toUpperCase() || null,
    veteran: player?.meta?.veteran || false,
    global: player?.global || {},
    characters: characters,
    guild: player?.guild || null,
  };
};

export const formatGuild = (guild: any) => {
  const members = [];
  for (const member of guild.members) {
    members.push({
      username: member.name,
      UUID: formatUUID(member.uuid),
      rank: member?.rank || null,
      contributed: member?.contributed || 0,
      joined: member?.joined ? Math.floor(new Date(member?.joined).valueOf() / 1000) : null,
    });
  }
  return {
    name: guild.name,
    prefix: guild?.prefix || null,
    members: members,
    XP: guild?.xp || 0,
    level: guild?.level || 0,
    created: guild?.created ? Math.floor(new Date(guild?.created).valueOf() / 1000) : null,
    territories: guild?.territories || 0,
    banner: guild?.banner || null,
  };
};

export const formatServerList = async (data: any, { UUIDs }: { UUIDs?: boolean }) => {
  const parsedData: any = [];
  for (const server of Object.keys(data)) {
    if (server === "request") continue;
    var players = [];
    for (const player of data[server]) {
      if (UUIDs) {
        players.push({
          UUID: await requestUUID(player).catch(() => {
            return null;
          }),
          username: player,
        });
      } else {
        players = data[server];
        break;
      }
    }
    parsedData[server] = {
      playercount: data[server].length,
      players: players.sort(),
    };
  }
  return parsedData;
};

export const formatTerritoryList = async (territories: any) => {
  const parsedTerritories = [];
  for (const territory in territories) {
    parsedTerritories.push({
      territory: territories[territory].territory,
      guild: territories[territory].guild !== "Nobody" ? territories[territory].guild : null,
      guildPrefix: territories[territory].guildPrefix,
      attacker: territories[territory].attacker || null,
      acquired: territories[territory]?.acquired ? Math.floor(new Date(territories[territory].acquired).valueOf() / 1000) : null,
      location: territories[territory].location,
    });
  }
  return parsedTerritories;
};
