const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { printOffers, getOrCreatePlayer } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check balance")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to check balance")
        .setRequired(false),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const player = await getOrCreatePlayer(interaction)
    if (player?.balance) {
      await interaction.reply(`${user} has **${player.balance}💎**.`);
    } else {
      await interaction.reply(`${user} has **0💎**.`);
    }
  },
};
