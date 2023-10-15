<template>
  <v-app :theme="theme">
    <v-app-bar density="compact" scroll-behavior="hide elevate" elevation="1" href="/">
      <v-app-bar-title><v-btn href="/" variant="plain" :ripple="false" style="font-size: medium; font: italic">Pixelic-API</v-btn></v-app-bar-title
      ><v-btn @click="toggleTheme" :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"></v-btn
    ></v-app-bar>
    <v-main>
      <RouterView />
    </v-main>
    <v-footer color="blue-grey-darken-3" dark>
      <v-row justify="center" class="my-4 text-center">
        <v-col cols="10">
          <v-btn color="secondary" variant="tonal" class="ml-1 mr-2" prepend-icon="mdi-forum" href="https://discord.com/invite/2vAuyVvdwj">Discord</v-btn>
          <v-btn color="secondary" variant="tonal" class="ml-2 mr-1" prepend-icon="mdi-source-branch" href="https://GitHub.com/Pixelicc/Pixelic-API">GitHub</v-btn>
        </v-col>
        <v-col cols="10" class="align-center">🌸 2022-{{ new Date().getFullYear() }} Pixelic-API 🌸</v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
// @ts-ignore
import { getTheme, setTheme } from "./stores/theme.js";

const theme = ref("");
theme.value = getTheme();

if (getTheme() === null) setTheme("light");

const toggleTheme = () => {
  setTheme(getTheme() === "light" ? "dark" : "light");
  theme.value = getTheme();
  console.log(`%c[Theme] Changed to ${getTheme()}`, "color: purple");
};

console.log("%cPixelic-API", "color: pink; font-size: 28px");
console.log("%cUI made with 💕", "color: purple; font-size: 16px");
console.log("%cOpensource on GitHub: https://GitHub.com/Pixelicc/Pixelic-API", "color: purple; font-size: 12px");
console.log("");
console.log("%c👀 Why are you looking into this?", "font-size: 12px");
console.log("");
</script>
