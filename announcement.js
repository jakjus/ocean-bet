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
Ocean Bot **is back live**!
Thank you for your support.

Admin may create new offer with **/newoffer**
`

client.once(Events.ClientReady, (c) => {
  client.guilds.cache.forEach(async g => {
    if (!g.systemChannelId) {
      return
    }
    try {
      client.channels.cache.get(g.systemChannelId).send(announcement)
    } catch (e) {
      console.log('Error sending to', g, '\n', e)
    }
  })
});

// Log in to Discord with your client's token
client.login(token);
