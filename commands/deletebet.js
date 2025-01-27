const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const {
  getOrCreatePlayer,
  printAllBet,
  betToOffer,
  prevbetAutocomplete,
} = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletebet")
    .setDescription("Delete a Bet")
    .addStringOption((option) =>
      option
        .setName("bet")
        .setDescription("Bet Offer to search for")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async autocomplete(interaction) {
    const myDb = await db.get(interaction.guildId);
    const field = interaction.options.getFocused(true);
    const player = await getOrCreatePlayer(interaction, myDb);
    prevbetAutocomplete(interaction, myDb, player, field);
  },
  async execute(interaction) {
    const betgroupUid = interaction.options.getString("bet");
    const myDb = await db.get(interaction.guildId);
    const player = await getOrCreatePlayer(interaction, myDb);
    const betgroupToDelete = player.bets.find(
      (betgroup) => betgroup.uid == betgroupUid,
    );
    if (!betgroupToDelete) {
      await interaction.reply({
        content: `Bet not found.`,
        ephemeral: true,
      });
      return;
    }
    const isLocked = betgroupToDelete.combination.some(
      (b) => betToOffer(b, myDb).locked,
    );
    if (isLocked) {
      await interaction.reply({
        content: `One or more bets in your bet combination is locked.`,
        ephemeral: true,
      });
      return;
    }
    player.balance += betgroupToDelete.amount;
    player.balance = Math.round(player.balance*10)/10
    player.bets = player.bets.filter(
      (betgroup) => betgroup.uid != betgroupToDelete.uid,
    );
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `${interaction.user} has deleted his bet:\n${printAllBet(betgroupToDelete, myDb)}\n\nReturned **${betgroupToDelete.amount}💎**`,
    );
  },
};
