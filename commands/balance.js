const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { printOffers } = require("../utils");

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
    const myDb = await db.get(interaction.guildId);
    let player = myDb.players.find((p) => p.userId == user.id);
    if (player?.balance) {
      await interaction.reply(`${user} has **${player.balance}💎**.`);
    } else {
      await interaction.reply(`${user} has **0💎**.`);
    }
  },
};
