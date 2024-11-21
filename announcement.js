require("dotenv").config();
const {
  Client,
  Events,
  ActivityType,
  GatewayIntentBits,
  Collection,
} = require("discord.js");
const token = process.env.TOKEN;

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const announcement = `
Ocean Bot **v2** is **live**!

- \`/parlaybet\` - create bet combination (parlay). First create normal bet with \`/bet\` and then use \`/parlaybet\` to add to combination
- \`/showbets\`
- \`/give\` now available for all - Give your gems to another player

Report bugs at discord.gg/NYUhKBz6ZB
`;

client.once(Events.ClientReady, (c) => {
  client.guilds.cache.forEach(async (g) => {
    if (!g.systemChannelId) {
      return;
    }
    try {
      client.channels.cache.get(g.systemChannelId).send(announcement);
    } catch (e) {
      console.log("Error sending to", g, "\n", e);
    }
  });
});

// Log in to Discord with your client's token
client.login(token);
