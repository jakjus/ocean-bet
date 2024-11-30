const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("[ADMIN] Add 💎 to players")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    //.addUserOption((option) =>
    //  option.setName("user").setDescription("User to add 💎 to").setRequired(true),
    //)
    .addMentionableOption((option) =>
      option.setName("to").setDescription("Group or User to add 💎").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount to add")
        .setMinValue(0)
        .setRequired(true),
    ),
  async execute(interaction) {
    const to = interaction.options.getMentionable("to");
    const ids = to.members ? [...to.members.keys()] : [to.user.id]
    const amount = interaction.options.getInteger("amount");
    const myDb = await db.get(interaction.guildId);
    for await (const userId of ids) {
      let player = myDb.players.find((p) => p.userId == userId);
      if (!player) {
        const initPlayer = { userId: userId, bets: [], balance: 0 };
        myDb.players.push(initPlayer);
        player = initPlayer;
      }
      player.balance += amount;
    }
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `[ADMIN] ${interaction.user} has added **${amount}💎** to ${to}.`,
    );
  },
};
