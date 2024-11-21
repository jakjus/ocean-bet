<h1 align="center">Ocean Bet - Betting Discord Bot</h1>
<p>
  <a href="https://github.com/jakjus/ocean-bet/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/jakjus/ocean-bet" />
  </a>
</p>

> Betting (Bookmaker) Discord Bot. Set your own events and odds. Lock in offer and announce event winner.

### 🚀 [Discord](https://discord.gg/NYUhKBz6ZB)

## Prerequisites

- NPM
- NodeJS

## Install

```sh
git clone git@github.com:jakjus/ocean-bet.git
cd ocean-bet/
npm install
```

## Setup

### Discord App

Register app in [Discord Develepers Portal](https://discord.com/developers/applications). Required privileges integer is: `2147485696`. Insert your client_id in URL below.

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147485696&scope=bot%20applications.commands
```

Go to [Discord Develepers Portal](https://discord.com/developers/applications) --> Your App --> Installation --> Install Link --> Paste the URL --> Save. You will use this URL to Invite your bot.

Go to [Discord Develepers Portal](https://discord.com/developers/applications) --> Your App --> Bot --> copy TOKEN. You will use this TOKEN in `.env`. _(Bot TOKEN is different than OAuth TOKEN!)_

### Edit config files

Rename `.env.example` with `.env`. Fill it with your own application's TOKEN and Client ID. `TOPGG_AUTH` is optional.

### Register slash commands

```sh
node register.js
```

It can take up to 10 minutes to propagate on all bots existing instances.

If you wish to register commands for testing on one Discord Server
(Guild), use:

```sh
GUILD_ID=your_guild_id node register.js
```

### Run bot

```sh
npm start
```

### How to use

- `/newoffer` (ADMIN) Create offer.
- `/bet` Bet on an offer.
- `/lock` (ADMIN) Lock the offer when event starts.
- `/announce` (ADMIN) Announce event winner.

## Author

👤 **Jakub Juszko**

- Website: https://jakjus.com
- Github: [@jakjus](https://github.com/jakjus)
- LinkedIn: [@jakubjuszko](https://linkedin.com/in/jakubjuszko)

## 🤝 Contributing

This package is not published on NPM, because the script is self-contained and I do not expect anyone to
plug it into a bigger script.

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/jakjus/ocean-bet/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2024 [Jakub Juszko](https://github.com/jakjus).<br />
This project is [MIT](https://github.com/jakjus/ocean-bet/blob/master/LICENSE) licensed.

---
