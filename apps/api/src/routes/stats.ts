import express from "express";
import { exec } from "child_process";
import redis from "@packages/redis";
import { client as mongo } from "@packages/mongo";
import axios from "axios";
import { formatBytes, formatNumber } from "@packages/utils";

const router = express.Router();

router.get("/v1/stats/code", async (req, res) => {
  res.set("Cache-Control", "public, max-age=3600");
  if (await redis.exists("API:Cache:Code-Stats")) return res.json({ success: true, ...JSON.parse((await redis.get("API:Cache:Code-Stats")) as string) });
  exec("pnpm exec cloc --json --docstring-as-code --include-lang=TypeScript,JavaScript --exclude-dir=dist,logs,node_modules ../../", async (error, stdout, stderr) => {
    if (error || stderr) return res.status(501).json({ success: false });
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
      languages[lang] = {
        files: raw[lang].nFiles,
        lines: raw[lang].code,
        comments: raw[lang].comment,
      };
    }

    const parsed = { languages, ...total };
    await redis.setex("API:Cache:Code-Stats", 3600, JSON.stringify(parsed));
    return res.json({
      success: true,
      ...parsed,
    });
  });
});

router.get("/v1/stats/repo", async (req, res) => {
  res.set("Cache-Control", "public, max-age=3600");
  if (await redis.exists("API:Cache:Repo-Stats")) return res.json({ success: true, ...JSON.parse((await redis.get("API:Cache:Repo-Stats")) as string) });
  axios
    .get("https://api.github.com/repos/pixelicc/pixelic-overlay")
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
      return res.status(501).json({ success: false });
    });
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
      bytesStoredFormatted: formatBytes(Number(info.used_memory), 3),
      keys: Number(info.db0.split("=")[1].split(",")[0]),
      keysFormatted: formatNumber(Number(info.db0.split("=")[1].split(",")[0]), 3),
      sinceRestart: {
        commandsProcessed: Number(info.total_commands_processed),
        commandsProcessedFormatted: formatNumber(Number(info.total_commands_processed), 3),
      },
    });
  } catch {
    return res.status(501).json({ success: false });
  }
});

router.get("/v1/stats/mongo", async (req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  try {
    const DBs = await mongo.db.admin().listDatabases();
    const total = {
      collections: 0,
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
        documents: data.objects,
        documentsFormatted: formatNumber(data.objects, 3),
        averageDocumentSize: data.avgObjSize,
        averageDocumentSizeFormatted: formatBytes(data.avgObjSize, 3),
        bytesStored: data.storageSize,
        bytesStoredFormatted: formatBytes(data.storageSize, 3),
      };
      total["collections"] += data.collections;
      total["documents"] += data.objects;
      total["averageDocumentSize"] += data.avgObjSize;
      total["bytesStored"] += data.storageSize;
    }
    total["documentsFormatted"] = formatNumber(total.documents, 3);
    total["averageDocumentSizeFormatted"] = formatNumber(total.averageDocumentSize / Object.keys(parsedDBs).length, 3);
    total["bytesStoredFormatted"] = formatBytes(total.bytesStored, 3);
    return res.json({ success: true, ...total, databases: parsedDBs });
  } catch {
    return res.status(501).json({ success: false });
  }
});

router.get("/v1/stats", async (req, res) => {
  res.set("Cache-Control", "public, max-age=10");
  try {
    const requests = Number(await redis.get("API:Analytics:Requests"));

    return res.json({
      success: true,
      requests: requests,
      requestsFormatted: formatNumber(requests, 3),
    });
  } catch {
    return res.status(501).json({ success: false });
  }
});

export default router;
