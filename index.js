require("dotenv").config();
const fs = require("node:fs");
const fetch = require("node-fetch");
const path = require("node:path");
const { db } = require("./db");
const { handleMessage } = require("./chat/handleMessage");
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

client.on("error", (e) => console.error(e));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error);
});

const setPres = async (newguild) => {
  if (newguild) {
    console.log(`Joined: ${newguild.name} | ${newguild.id}`);
  }
  let servercount = client.guilds.cache.size;
  let bot_id = process.env.CLIENT_ID;
  if (process.env.TOPGG_AUTH && process.env.TOPGG_AUTH != "") {
    try {
      await fetch(`https://top.gg/api/bots/${bot_id}/stats`, {
        method: "POST",
        body: JSON.stringify({ server_count: servercount }),
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.TOPGG_AUTH,
        },
      });
    } catch (e) {
      console.log(`Error sending status to Top.gg: ${e}`);
    }
  }

  client.user.setPresence({
    activities: [
      {
        name: "/newoffer | " + servercount + " servers",
        type: ActivityType.Playing,
      },
    ],
  });
};

client.on("error", (e) => console.error(e));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error);
});

client.on("guildCreate", (guild) => {
  db.set(guild.id, { offers: [], players: [], reward: 10 });
  setPres(guild);
});

client.on("guildDelete", (guild) => {
  db.delete(guild.id);
  setPres();
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  setPres();
  client.guilds.cache.forEach(async (g) => {
    const existing = await db.get(g.id);
    if (!existing) {
      console.log(
        `Init data does not exist for guild ${g.id}: ${g.name}, that bot is already in. Initializing guild settings.`,
      );
      db.set(g.id, { offers: [], players: [], reward: 10 });
    }
  });
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

client.on(Events.MessageCreate, async (message) => {
  handleMessage(message);
});

client.on(Events.InteractionCreate, async (interaction) => {
  const command = interaction.client.commands.get(interaction.commandName);
  if (interaction.isAutocomplete()) {
    try {
      await command.autocomplete(interaction);
    } catch (e) {
      console.error(e);
    }
    return;
  }
  if (!interaction.isChatInputCommand()) return;

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    return;
    //await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});
