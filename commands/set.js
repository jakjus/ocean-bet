const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");
const { getOrCreatePlayer } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("[ADMIN] Set 💎 of players")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addMentionableOption((option) =>
      option.setName("to").setDescription("Group or User to set 💎").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("New Amount")
        .setMinValue(0)
        .setRequired(true),
    ),
  async execute(interaction) {
    const to = interaction.options.getMentionable("to");
    const ids = to.members ? [...to.members.keys()] : [to.user.id]
    const amount = interaction.options.getInteger("amount");
    const myDb = await db.get(interaction.guildId);
    const preBalances = {}
    for await (const userId of ids) {
      let player = myDb.players.find((p) => p.userId == userId);
      if (!player) {
        const initPlayer = { userId: userId, bets: [], balance: 0 };
        myDb.players.push(initPlayer);
        player = initPlayer;
      }
      preBalances[userId] = player.balance
      player.balance = amount;
    }
    db.set(interaction.guildId, myDb);
    const prebalString = ids.map(id => `<@${id}>: **${preBalances[id]}💎**`).join(' / ')
    await interaction.reply(
      `[ADMIN] ${interaction.user} has changed balances of ${to} (${prebalString}) to **${amount}💎**.`.slice(0, 1999)
    );
  },
};
