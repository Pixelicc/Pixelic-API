<div align="center">

# Pixelic-API

An API focused on Minecraft related data

</div>

## 📗 Usage

- Some Endpoints require usage of an [`API-Key`](https://api.pixelic.de/#section/Authentication)
- All production-ready endpoints can be found in the [`Documentation`](https://api.pixelic.de) 

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
- Use `pnpm {appName} start` to run an app, eg `pnpm api start` to run the API
