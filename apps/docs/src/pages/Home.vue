<template>
  <v-app>
    <v-row justify="center" class="text-center">
      <v-col>
        <v-divider :thickness="48" class="border-opacity-0"></v-divider>
        <h1>Pixelic-API</h1>
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <h4>Easily request Historical Data about various Minecraft related things</h4>
      </v-col>
    </v-row>
    <v-row justify="center" align="center" class="text-center">
      <v-card class="pa-4 ma-10" variant="tonal" color="primary">
        <v-icon>mdi-web</v-icon>
        {{ APIStats.overall.requestsFormatted }} Requests
      </v-card>
      <v-card class="pa-4 ma-10" variant="tonal" color="primary">
        <v-icon>mdi-chart-donut</v-icon>
        {{ formatNumber(APIStats.mongo.documents + APIStats.redis.keys, 2) }} Datapoints</v-card
      >
      <v-card class="pa-4 ma-10" variant="tonal" color="primary">
        <v-icon>mdi-database</v-icon>
        {{ formatBytes(APIStats.mongo.bytesStored + APIStats.redis.bytesStored, 2) }} Stored</v-card
      >
    </v-row>
    <v-row justify="center" class="text-center">
      <v-col>
        <v-btn color="primary" prepend-icon="mdi-open-in-new" href="/docs">Open Documentation</v-btn>
      </v-col>
    </v-row>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";

const formatNumber = (bytes: number, digits: number) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "t" },
  ];
  const rx = /.0+$|(.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find((item) => {
      return bytes >= item.value;
    });
  return item ? (bytes / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
};

const formatBytes = (bytes: number, digits: number) => {
  const lookup = [
    { value: 1, symbol: "B" },
    { value: 1e3, symbol: "KB" },
    { value: 1e6, symbol: "MB" },
    { value: 1e9, symbol: "GB" },
    { value: 1e12, symbol: "TB" },
  ];
  const rx = /.0+$|(.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find((item) => {
      return bytes >= item.value;
    });
  return item ? (bytes / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
};

const APIStats = ref();
APIStats.value = {
  overall: {
    requestsFormatted: "0",
  },
  mongo: {
    documents: 0,
    bytesStored: 0,
  },
  redis: {
    keys: 0,
    bytesStored: 0,
  },
};

const fetchAPIStats = () => {
  fetch("https://api.pixelic.de/v1/stats", { headers: { "Cache-Control": "max-age=0" } })
    .then(async (res) => {
      if (res.status === 200) {
        const stats = await res.json();
        APIStats.value.overall = stats;
      } else {
        console.error("Failed to fetch API Overall Stats!");
      }
    })
    .catch(() => console.error("Failed to fetch API Overall Stats!"));
  fetch("https://api.pixelic.de/v1/stats/mongo", { headers: { "Cache-Control": "max-age=0" } })
    .then(async (res) => {
      if (res.status === 200) {
        const stats = await res.json();
        APIStats.value.mongo = stats;
      } else {
        console.error("Failed to fetch API Mongo Stats!");
      }
    })
    .catch(() => console.error("Failed to fetch API Mongo Stats!"));
  fetch("https://api.pixelic.de/v1/stats/redis", { headers: { "Cache-Control": "max-age=0" } })
    .then(async (res) => {
      if (res.status === 200) {
        const stats = await res.json();
        APIStats.value.redis = stats;
      } else {
        console.error("Failed to fetch API Redis Stats!");
      }
    })
    .catch(() => console.error("Failed to fetch API Redis Stats!"));
};
fetchAPIStats();
setInterval(() => fetchAPIStats(), 60000);
</script>
