<template>
  <v-app theme="light">
    <div id="redoc"></div>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

const loadingTimer = Date.now();
onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";
  script.async = true;
  script.onload = async () => {
    // @ts-ignore
    await Redoc.init(
      "https://api.pixelic.de/docs",
      {
        expandResponses: "all",
        hideDownloadButton: true,
        nativeScrollbars: true,
      },
      document.getElementById("redoc")
    );
    console.log(`%c[Documentation] Loaded in ${Date.now() - loadingTimer}ms`, "color: purple");
  };
  document.body.appendChild(script);
});
</script>
