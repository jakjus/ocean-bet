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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences],
});

const announcement = `
New feature:
- **/add** command - add gems to player or group
- now you can use **/add** and **/set** on a user or **group** (any role). you can also set or add gems to everyone by using everyone tag in select option


Report bugs and request features at discord.gg/NYUhKBz6ZB
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
