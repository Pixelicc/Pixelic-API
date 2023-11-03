<template>
  <v-app theme="light">
    <div id="redoc"></div>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import docs from "../data/docs.js";

onMounted(() => {
  const loadingTimer = Date.now();
  const script = document.createElement("script");
  script.src = "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";
  script.async = true;
  script.onload = async () => {
    // @ts-ignore
    await Redoc.init(
      docs,
      {
        expandResponses: "",
        hideDownloadButton: true,
        nativeScrollbars: true,
      },
      document.getElementById("redoc")
    );
    console.log(`%c[Documentation] Loaded ${Object.keys(docs.paths).length} paths, ${Object.keys(docs.components.responses).length} responses, ${Object.keys(docs.components.headers).length} headers & ${Object.keys(docs.components.parameters).length} parameters in ${Date.now() - loadingTimer}ms`, "color: purple");
  };
  document.body.appendChild(script);
});
</script>
