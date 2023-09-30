import { decodeTime } from "ulidx";
import { parse, simplify } from "prismarine-nbt";

export const decodeULIDTime = (ULID: string) => decodeTime(ULID);

export const decodeNBT = async (buffer: Buffer) => {
  try {
    return simplify((await parse(buffer)).parsed).i[0];
  } catch {
    return null;
  }
};
