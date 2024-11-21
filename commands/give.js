const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");
const { getOrCreatePlayer } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Transfer your 💎 to another player")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to give 💎 to")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount")
        .setMinValue(1)
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const myDb = await db.get(interaction.guildId);
    const from = await getOrCreatePlayer(interaction, myDb);
    let to = myDb.players.find((p) => p.userId == user.id);
    if (!to) {
      const initPlayer = { userId: user.id, bets: [], balance: 0 };
      myDb.players.push(initPlayer);
      to = initPlayer;
    }
    if (from.balance < amount) {
      await interaction.reply({
        content: `You don't have ${amount}💎.\nYour current balance is ${from.balance}💎.`,
        ephemeral: true,
      });
      return;
    }
    from.balance -= amount;
    to.balance += amount;
    db.set(interaction.guildId, myDb);
    await interaction.reply(`${interaction.user} gave ${amount}💎 to ${user}.`);
  },
};
