<div align="center">

# Pixelic-API

An API focused on Minecraft related data

</div>
<div align="center">
    <a href="https://discord.com/invite/2vAuyVvdwj"><img src="https://img.shields.io/discord/926873163411910746?color=7289DA&label=Discord&logo=Discord" alt="Discord"></a>
    <a><img src="https://wakatime.com/badge/user/fdd9682f-df58-46bb-9b10-374601d7f52d/project/838fd6e7-9cf0-4d5d-8986-aa7535ca3ec5.svg" alt="wakatime"></a>
</div>
<div align="center">
    <a><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.pixelic.de%2Fstats&query=%24.requestsFormatted&logo=Express&label=Requests served" alt="Express: Requests served"></a>
    <a><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.pixelic.de%2Fv1%2Fstats%2Fmongo&query=%24.documentsFormatted&logo=MongoDB&label=Datapoints" alt="MongoDB: Datapoints"></a>
    <a><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.pixelic.de%2Fv1%2Fstats%2Fmongo&query=%24.bytesStoredFormatted&logo=MongoDB&label=Data stored" alt="MongoDB: Data stored"></a>
</div>

## 📗 Usage

- Most Endpoints require usage of an [`API-Key`](https://docs.pixelic.de/docs/#section/Authentication)
- All production-ready endpoints can be found in the [`Documentation`](https://docs.pixelic.de)

## 💻 Developing

### ⚒️ Requirements

- [`Node.js`](https://nodejs.org/en/download/current/) » For running code (`v20`)
- [`pnpm`](https://pnpm.io/) » Installing packages and running scripts (`npm install -g pnpm`)
- [`MongoDB`](https://www.mongodb.com/) » For persisting data
- [`Redis Stack`](https://redis.io/docs/about/about-stack/) » For caching data and frequently accessed data

- [`Hypixel API-Key`](https://developer.hypixel.net/) » For requesting Hypixel data, visit the [Hypixel Developer Portal](https://developer.hypixel.net/)

### 🚀 Running

- The codebase is split into apps and packages
- Set up a `config.js` file in the root of the project following the `config.schema.js` file (copy paste it over and fill it in)
- Use `pnpm install` to install the required packages
- Use `pnpm build` to build all packages and apps
- Use `pnpm {appName} start` to run a specific app, eg `pnpm api start` to run the API
- Use `pnpm start` to run all apps
- Use `pnpm stop` to stop all apps
