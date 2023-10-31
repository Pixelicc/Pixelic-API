import mc, { NewPingResult } from "minecraft-protocol";
import log from "@pixelic/logger";

/**
 * Send a Minecraft Sever List Ping (SLP) to the specified host and port
 */
export const sendSLP = async (host: string, port: string | number, options?: { timeout: number }) => {
  if (options?.timeout) {
    return Promise.race([
      new Promise<null>((resolve) =>
        setTimeout(() => {
          resolve(null);
        }, options.timeout)
      ),
      new Promise<NewPingResult | null>(async (resolve) => {
        try {
          const SLPData = (await mc.ping({ host, port: Number(port) })) as NewPingResult;
          log("Utils", `Pinged ${host}:${port} (${SLPData?.latency || -1}ms)`, "info");
          resolve(SLPData);
        } catch {
          log("Utils", `Failed to ping ${host}:${port}`, "warn");
          resolve(null);
        }
      }),
    ]);
  } else {
    try {
      const SLPData = (await mc.ping({ host, port: Number(port) })) as NewPingResult;
      log("Utils", `Pinged ${host}:${port} (${SLPData?.latency || -1}ms)`, "info");
      return SLPData;
    } catch {
      log("Utils", `Failed to ping ${host}:${port}`, "warn");
      return null;
    }
  }
};
