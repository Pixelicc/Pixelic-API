<div align="center">

# Pixelic-API

An API focused on Minecraft related data

</div>

## 💻 Developing

### ⚒️ Requirements

- [`Node.js`]: For running code (`v20`)
- [`pnpm`]: Installing packages and running scripts (`npm install -g pnpm`)
- [`MongoDB`]: For Persistent data ([`Atlas`])
- [`Redis`]: For Caching ([`Redis Cloud`])

- [`Hypixel API-Key`]: For requesting Hypixel data, Visit the [Hypixel Developer Portal](https://developer.hypixel.net/)

### 🚀 Running

- The codebase is split into apps and packages
- Set up a `config.js` file in the root of the project following the `config.schema.js` file (copy paste it over and fill it in)
- Use `pnpm install` to install the required packages,
- Use `pnpm build` to build all packages and apps,
- Use `pnpm {appName} start` to run an app, eg `pnpm core-api start` to run the Core-API
