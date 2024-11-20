const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { getOrCreatePlayer, printAllBet } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mybets")
    .setDescription("Show my current bets"),
  async execute(interaction) {
    const myDb = await db.get(interaction.guildId);
    const player = await getOrCreatePlayer(interaction, myDb)
    if (player.bets?.length > 0) {
      await interaction.reply(`Current Bets of ${interaction.user}:\n\n------------------\n${player.bets.map(betgroup => printAllBet(betgroup, myDb)).join('\n------------------\n')}\n------------------\n`);
    } else {
      await interaction.reply({
        content: `You have no active bets.\nPlace a bet with **/bet**`,
        ephemeral: true
      });
    }
  },
};
