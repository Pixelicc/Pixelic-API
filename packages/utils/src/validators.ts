import { formatUUID } from "./formatters.js";

export const validateUUID = (UUID: string) => {
  if (UUID === undefined) return false;
  UUID = formatUUID(UUID);
  if (UUID.length !== 32) return false;
  return /[0-9a-f]{12}4[0-9a-f]{19}/.test(UUID);
};

export const validateUsername = (username: string) => /^[a-zA-Z0-9_]{2,16}$/.test(username);

export const validateSkyblockItemID = (ID: string) => /^[A-Z\d\_:]+$/.test(ID);
