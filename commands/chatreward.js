const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatreward")
    .setDescription("[ADMIN] Set average reward 💎 for chatting")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addIntegerOption((option) =>
      option
        .setName("reward")
        .setDescription("Reward Amount for 50~ messages (8s cooldown per msg)")
        .setMinValue(0)
        .setRequired(true),
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("reward");
    const myDb = await db.get(interaction.guildId);
    const prevAmount = myDb.reward;
    myDb.reward = amount;
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `[ADMIN] ${interaction.user} has changed chatting reward from **${prevAmount}💎** to **${amount}💎**`,
    );
  },
};
