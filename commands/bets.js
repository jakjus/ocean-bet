const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { getOrCreatePlayer, printAllBet } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bets")
    .setDescription("Show bets of Player")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to check bets of")
        .setRequired(false),
    ),
  async execute(interaction) {
    const myDb = await db.get(interaction.guildId);
    const user = interaction.options.getUser("user") || interaction.user;
    const player = myDb.players.find((p) => p.userId == user.id);
    if (player?.bets?.length > 0) {
      await interaction.reply(`Current Bets of ${user}:\n\n------------------\n${player.bets.map(betgroup => printAllBet(betgroup, myDb)).join('\n------------------\n')}\n------------------\n`);
    } else {
      await interaction.reply({
        content: `${user} has no active bets.\nPlayer can place a bet with **/bet**`,
        ephemeral: true
      });
    }
  },
};
