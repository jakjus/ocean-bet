const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");
const { getOrCreatePlayer } = require("../utils")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("[ADMIN] Set 💎 of player")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("User to set 💎").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("New Amount")
        .setMinValue(0)
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const myDb = await db.get(interaction.guildId);
    let player = myDb.players.find((p) => p.userId == user.id);
    if (!player) {
      const initPlayer = { userId: user.id, bets: [], balance: 0 }
      myDb.players.push(initPlayer);
      player = initPlayer
    }
    const prevBal = player.balance;
    player.balance = amount;
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `[ADMIN] ${interaction.user} has changed balance of ${user} from **${prevBal}💎** to **${amount}💎**.`,
    );
  },
};
