import { createHash } from "crypto";

export const hashSHA512 = (str: string) => createHash("sha512").update(str).digest("hex");
