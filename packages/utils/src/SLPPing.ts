import mc from "minecraft-protocol";

export const sendSLP = async (host: string, port: string | number) => {
  try {
    return await mc.ping({ host, port: Number(port) });
  } catch {
    return null;
  }
};
