import mc, { NewPingResult } from "minecraft-protocol";
import log from "@pixelic/logger";

/**
 * Send a Minecraft Sever List Ping (SLP) to the specified host and port
 */
export const sendSLP = async (host: string, port: string | number) => {
  try {
    const SLPData = (await mc.ping({ host, port: Number(port) })) as NewPingResult;
    log("Utils", `Pinged ${host}:${port} (${SLPData?.latency || -1}ms)`, "info");
    return SLPData;
  } catch {
    log("Utils", `Failed to ping ${host}:${port}`, "warn");
    return null;
  }
};
