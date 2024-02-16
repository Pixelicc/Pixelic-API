import express from "express";
import { docs } from "@pixelic/constants";

const router = express.Router();

router.get("/", async (req, res) => {
  res.set("Cache-Control", `public, max-age=300`);
  res.set("Content-Type", "text/html");
  return res.send(`
  <!DOCTYPE html>
  <html>
  <head>
  <title>Pixelic-API - Documentation</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
  <style>
  body * {
    font-family: 'Roboto';
  }
  </style>
  </head>
  <body>
  <redoc spec-url="https://api.pixelic.app/docs"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
  </html>
  `);
});

router.get("/docs", async (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  return res.json(docs);
});

router.get("/legal/tos", async (req, res) => {
  return res.send(`
  <!DOCTYPE html>
  <html>
  <head>
  <title>Pixelic-API - Terms of Service</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css?family=Jost" rel="stylesheet" />
  </head>
  <body>
  <pre style="font-family: 'Jost'">
    Usage of the Pixelic.app API may collect END USER DATA as described below.
    
    By using this API in any way you agree to your requests being logged for abuse prevention purposes.
    
    If you have generated an API-Key for the Pixelic.app API we will collect specific END USER DATA which is considered PERSONALLY IDENTIFIABLE:
    
    The Discord Account linked to the API-Key
    The Minecraft Account that may be linked to the API-Key
    IP Addresses used with the API-Key
    Previous API-Keys generated
    Up to 1000 of the most recent requests including the following data: URL, Timestamp, Method, Headers, UserAgent and IP
    
    GDPR Right to access:
    If you wish to review any END USER DATA we store on yourself please visit: https://api.pixelic.app/v1/user

    GDPR Right to erasure ("right to be forgotten"):
    If you wish to delete any END USER DATA we store on yourself please do this with the /api-key command in our discord support server or by sending an request to the https://api.pixelic.app/v1/user Endpoint with the DELETE Method
    
    To speak to a member of staff please join our discord support server through: https://discord.com/invite/2vAuyVvdwj
  </strong>
  </pre>
  </body>
  </html>
  `);
});

export default router;
