const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Check TOP 15 in this Server"),
  async execute(interaction) {
    const myDb = await db.get(interaction.guildId);
    let playersS = myDb.players
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 15)
      .map(
        (v, i) =>
          `${i + 1}. <@${v.userId}> **${v.balance+v.bets.map(betgroup => betgroup.amount).reduce((a,b) => a+b, 0)}💎**`,
      )
      .join("\n");
    await interaction.reply(`🏆 **Leaderboards**\n${playersS}`);
  },
};
