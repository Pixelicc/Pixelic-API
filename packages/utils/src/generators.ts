import { v4 as uuidv4 } from "uuid";
import { ulid } from "ulidx";
import { randomBytes } from "crypto";

export const generateUUID = () => uuidv4();

export const generateULID = () => ulid();

export const generateHexID = (length: number) => {
  const bytes = randomBytes(Math.ceil(length / 2));
  return bytes.toString("hex").slice(0, length);
};
