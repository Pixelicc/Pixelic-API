import express from "express";
import axios from "axios";
import { requestTracker } from "@pixelic/interceptors";
import { config, formatUUID, generateUUID, hashSHA512 } from "@pixelic/utils";
import { APIAuthRole, APIAuthScope } from "@pixelic/types";
import { DiscordSnowflake } from "@pixelic/types";
import redis from "@pixelic/redis";
import { authorization } from "@pixelic/middlewares";

axios.interceptors.response.use(requestTracker);

const router = express.Router();

const createUser = async ({ role, scopes, discord }: { role: APIAuthRole | undefined; scopes: APIAuthScope[] | undefined; discord: { ID: DiscordSnowflake; [key: string]: any } }) => {
  if (await redis.exists(`API:Users:${String(discord?.ID)}`)) throw new Error("A User with this ID already exists");

  if (typeof discord?.ID !== "string") throw new Error("Invalid Discord ID");
  if (!["string", "undefined"].includes(typeof role)) throw new Error("Invalid Role");
  if (!["object", "undefined"].includes(typeof scopes) || (typeof scopes === "object" && !Array.isArray(scopes))) throw new Error("Invalid Scopes");

  const key = formatUUID(generateUUID());

  await redis.hset(`API:Users:${discord.ID}`, {
    timestamp: Math.floor(Date.now() / 1000),
    discord: JSON.stringify(discord),
    role: role || "USER",
    scopes: JSON.stringify(scopes || []),
    linkedAccounts: JSON.stringify([]),
    keyHash: hashSHA512(key),
  });
  await redis.hset(`API:Users:Keys:${hashSHA512(key)}`, {
    timestamp: Math.floor(Date.now() / 1000),
    owner: discord.ID,
    role: role || "",
    scopes: JSON.stringify(scopes || []),
  });

  return {
    user: {
      timestamp: Math.floor(Date.now() / 1000),
      discord,
      role: role || "USER",
      scopes: scopes || [],
      linkedAccounts: [],
      key: key,
      keyHash: hashSHA512(key),
    },
    key: {
      timestamp: Math.floor(Date.now() / 1000),
      owner: discord.ID,
      role: role || "USER",
      scopes: scopes || [],
    },
  };
};

const regenerateUserKey = async (user: DiscordSnowflake) => {
  if (!(await redis.exists(`API:Users:${String(user)}`))) throw new Error("No User with this ID exists");

  const key = formatUUID(generateUUID());

  await redis.rename(`API:Users:Keys:${await redis.hget(`API:Users:${user}`, "keyHash")}`, `API:Users:Keys:${hashSHA512(key)}`);
  await redis.hset(`API:Users:Keys:${hashSHA512(key)}`, { lastKeyRegeneration: Math.floor(Date.now() / 1000) });
  await redis.hset(`API:Users:${user}`, { keyHash: hashSHA512(key) });
  await redis.hincrby(`API:Users:${user}`, "keyRegenerations", 1);

  return {
    key,
    keyHash: hashSHA512(key),
  };
};

router.get("/oauth/discord", async (req, res) => {
  if (req.query.action !== "user.create" && req.query.action !== "user.key.regenerate") res.status(422).send("Invalid Action");
  axios
    .post("https://discord.com/api/oauth2/token", { client_id: config.API.OAuth2.discord.clientID, client_secret: config.API.OAuth2.discord.clientSecret, code: req.query.code, grant_type: "authorization_code", redirect_uri: req.query.action === "user.create" ? config.API.OAuth2.discord.redirectURLs.userCreate : config.API.OAuth2.discord.redirectURLs.userKeyRegenerate, scope: "identify" }, { headers: { "Content-Type": "application/x-www-form-urlencoded" } })
    .then((oauth2) => {
      axios
        .get("https://discord.com/api/users/@me", { headers: { Authorization: `${oauth2.data.token_type} ${oauth2.data.access_token}` } })
        .then(async (user) => {
          if (req.query.action === "user.create") {
            await createUser({
              role: "USER",
              scopes: [],
              discord: {
                ID: user.data.id,
                username: user.data.username,
                displayname: user.data.global_name,
              },
            })
              .then((createdUser) => {
                return res.send(`Your Pixelic API-Key: <b>${createdUser.user.key}</b><br><br>This is the last time you'll be able to see your API-Key without regenerating it!</br>So please copy and paste it somewhere safe!`);
              })
              .catch(() => {
                return res.status(522).send("This Discord Account already has an API User linked to it. If you think this is an error please contact an Admin!");
              });
          } else if (req.query.action === "user.key.regenerate") {
            await regenerateUserKey(user.data.id)
              .then((regeneratedKey) => {
                return res.send(`Your new Pixelic API-Key: <b>${regeneratedKey.key}</b><br><br>This is the last time you'll be able to see your API-Key without regenerating it again!</br>So please copy and paste it somewhere safe!`);
              })
              .catch(() => {
                return res.status(522).send("This Discord Account does not have an API User linked to it. If you think this is an error please contact an Admin!");
              });
          }
        })
        .catch(() => {
          return res.status(422).send("Invalid OAuth2");
        });
    })
    .catch(() => {
      return res.status(422).send("Invalid OAuth2");
    });
});

router.post("/v1/user", authorization({ role: "ADMIN", scope: "user:create" }), (req, res) => {
  createUser({ role: req.body.role, scopes: req.body.scopes, discord: req.body.discord })
    .then((createdUser) => {
      return res.json({ success: true, ...createdUser });
    })
    .catch((error) => {
      return res.status(422).json({ success: false, cause: error });
    });
});

router.patch("/v1/user/key", authorization({ role: "ADMIN", scope: "key:regenerate" }), (req, res) => {
  if (!req.query.discordID) return res.status(422).json({ success: false, cause: "No Discord ID provided" });
  regenerateUserKey(String(req.query.discordID))
    .then((regeneratedKey) => {
      return res.json({ success: true, ...regeneratedKey });
    })
    .catch((error) => {
      return res.status(422).json({ success: false, cause: error });
    });
});

export default router;
