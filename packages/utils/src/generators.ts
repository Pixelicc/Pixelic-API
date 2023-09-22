import { v4 as uuidv4 } from "uuid";
import { ulid } from "ulidx";

export const generateUUID = () => uuidv4();

export const generateULID = () => ulid();
