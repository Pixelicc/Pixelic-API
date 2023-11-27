import express from "express";
import * as Sentry from "@sentry/node";
import { exec } from "child_process";
import redis from "@pixelic/redis";
import { client as mongo } from "@pixelic/mongo";
import axios from "axios";
import { formatBytes, formatNumber, objectStringToNumber } from "@pixelic/utils";

const router = express.Router();

router.get("/v1/stats/code", async (req, res) => {
  res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  try {
    if (await redis.exists("API:Cache:Code-Stats")) return res.json({ success: true, ...JSON.parse((await redis.get("API:Cache:Code-Stats")) as string) });
    if (await redis.exists(`API:Locks:Code-Scanning`)) {
      const checkRecursive = async (): Promise<any> => {
        return setTimeout(async () => {
          if (await redis.exists(`API:Locks:Code-Scanning`)) {
            return await checkRecursive();
          }
          return res.json({ success: true, ...JSON.parse((await redis.get("API:Cache:Code-Stats")) as string) });
        }, 500);
      };
      return checkRecursive();
    } else {
      await redis.set(`API:Locks:Code-Scanning`, "");
      exec("pnpm exec cloc --json --docstring-as-code --exclude-ext=json,yaml,md --exclude-dir=dist,logs,node_modules ../../", async (error, stdout, stderr) => {
        if (error || stderr) return res.status(500).json({ success: false });
        const raw = JSON.parse(stdout);
        delete raw.header;
        const languages: any = {};
        var total;
        for (const lang in raw) {
          if (lang === "SUM") {
            total = {
              files: raw[lang].nFiles,
              lines: raw[lang].code,
              comments: raw[lang].comment,
            };
            continue;
          }
          var formattedLang = lang;
          if (lang === "Vuejs Component") formattedLang = "Vue.js";
          languages[formattedLang] = {
            files: raw[lang].nFiles,
            lines: raw[lang].code,
            comments: raw[lang].comment,
          };
        }
        const parsed = { languages, ...total };

        await redis.setex("API:Cache:Code-Stats", 3600 * 3, JSON.stringify(parsed));
        await redis.del("API:Locks:Code-Scanning");
        return res.json({
          success: true,
          ...parsed,
        });
      });
    }
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/stats/repo", async (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  try {
    if (await redis.exists("API:Cache:Repo-Stats")) return res.json({ success: true, ...JSON.parse((await redis.get("API:Cache:Repo-Stats")) as string) });
    axios
      .get("https://api.github.com/repos/pixelicc/pixelic-api")
      .then(async (github) => {
        const parsed = {
          ID: github.data.id,
          name: github.data.name,
          fullName: github.data.full_name,
          description: github.data.description,
          tags: github.data.topics,
          owner: {
            ID: github.data.owner.id,
            username: github.data.owner.login,
          },
          created: Math.floor(new Date(github.data.created_at).valueOf() / 1000),
          lastUpdated: Math.floor(new Date(github.data.updated_at).valueOf() / 1000),
          lastPushed: Math.floor(new Date(github.data.pushed_at).valueOf() / 1000),
          watchers: github.data.watchers_count,
          stars: github.data.stargazers_count,
          forks: github.data.forks_count,
          openIssues: github.data.open_issues_count,
        };

        await redis.setex("API:Cache:Repo-Stats", 3600, JSON.stringify(parsed));
        return res.json({
          success: true,
          ...parsed,
        });
      })
      .catch(() => {
        return res.status(500).json({ success: false });
      });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/stats/redis", async (req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  try {
    const data = await redis.info("everything");
    const info: any = {};
    for (const line of data.split("\r\n")) {
      const split = line.split(":");
      info[split[0]] = split[1];
    }
    return res.json({
      success: true,
      bytesStored: Number(info.used_memory),
      bytesStoredFormatted: formatBytes(Number(info.used_memory), 2),
      keys: Number(info.db0.split("=")[1].split(",")[0]),
      keysFormatted: formatNumber(Number(info.db0.split("=")[1].split(",")[0]), 2),
      averageKeySize: Number(info.used_memory) / Number(info.db0.split("=")[1].split(",")[0]),
      averageKeySizeFormatted: formatBytes(Number(info.used_memory) / Number(info.db0.split("=")[1].split(",")[0]), 2),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/stats/mongo", async (req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  try {
    const DBs = await mongo.db.admin().listDatabases();
    const total = {
      collections: 0,
      indexes: 0,
      documents: 0,
      documentsFormatted: "",
      averageDocumentSize: 0,
      averageDocumentSizeFormatted: "",
      bytesStored: 0,
      bytesStoredFormatted: "",
    };
    const parsedDBs: any = {};
    for (const db of DBs.databases) {
      if (["admin", "config", "local"].includes(db.name)) continue;
      const data = await mongo.useDb(db.name).db.stats();
      parsedDBs[db.name] = {
        collections: data.collections,
        indexes: data.indexes,
        documents: data.objects,
        documentsFormatted: formatNumber(data.objects, 2),
        averageDocumentSize: data.avgObjSize,
        averageDocumentSizeFormatted: formatBytes(data.avgObjSize, 2),
        bytesStored: data.storageSize,
        bytesStoredFormatted: formatBytes(data.storageSize, 2),
      };
      total.collections += data.collections;
      total.indexes += data.indexes;
      total.documents += data.objects;
      total.averageDocumentSize += data.avgObjSize;
      total.bytesStored += data.storageSize;
    }
    total.documentsFormatted = formatNumber(total.documents, 2);
    total.averageDocumentSizeFormatted = formatBytes(total.averageDocumentSize, 2);
    total.bytesStoredFormatted = formatBytes(total.bytesStored, 2);
    return res.json({ success: true, ...total, databases: parsedDBs });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

router.get("/v1/stats", async (req, res) => {
  res.set("Cache-Control", "public, max-age=10");
  try {
    const requests = Number(await redis.get("API:Analytics:Requests"));

    return res.json({
      success: true,
      requests: requests,
      requestsFormatted: formatNumber(requests, 2),
      requestsHistory: objectStringToNumber(await redis.hgetall("API:Analytics:RequestsHistory")),
    });
  } catch (e) {
    Sentry.captureException(e);
    return res.status(500).json({ success: false });
  }
});

export default router;
