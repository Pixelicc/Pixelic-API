import mc, { NewPingResult } from "minecraft-protocol";

/**
 * Send a Minecraft Sever List Ping (SLP) to the specified host and port
 */
export const sendSLP = async (host: string, port: string | number) => {
  try {
    return (await mc.ping({ host, port: Number(port) })) as NewPingResult;
  } catch {
    return null;
  }
};
