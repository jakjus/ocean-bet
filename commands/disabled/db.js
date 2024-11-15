const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { printOffers } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder().setName("db").setDescription("Show db"),
  async execute(interaction) {
    const myDb = await db.get(interaction.guildId);
    console.log(JSON.stringify(myDb, null, 2));
    await interaction.reply(`Shown.`);
  },
};
