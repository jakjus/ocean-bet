const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { printOdds, printAllBet } = require("../utils");
const { prevbetAutocomplete } = require("./common/prevbetAutocomplete")

const betToOffer = b => myDb.offers.find((o) => b.offerUid == o.uid)

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
    const field = interaction.options.getFocused(true)
    const player = myDb.players.find((p) => p.userId == interaction.user.id);
    prevbetAutocomplete(interaction, myDb, player, field)
  },
  async execute(interaction) {
    const betgroupUid = interaction.options.getString("bet");
    const myDb = await db.get(interaction.guildId);
    let player = myDb.players.find((p) => p.userId == interaction.user.id);
    if (!player) {
      myDb.players.push({ userId: interaction.user.id, bets: [], balance: 0 });
      await interaction.reply({
        content: `You don't have ${amount}💎.\nYour current balance is 0💎.`,
        ephemeral: true,
      });
      return;
    }
    const betgroupToDelete = player.bets.find(betgroup => betgroup.uid == betgroupUid)
    if (!betgroupToDelete) {
      await interaction.reply({
        content: `Bet not found.`,
        ephemeral: true,
      });
      return;
    }
    const isLocked = betgroupToDelete.combination.some(b => betToOffer(b).locked)
    if (isLocked) {
      await interaction.reply({
        content: `One or more bets in your bet combination is locked.`,
        ephemeral: true,
      });
      return;
    }
    player.balance += activeBet.amount;
    player.bets = player.bets.filter((betgroup) => betgroup.uid != betgroupToDelete.uid);
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `${interaction.user} has deleted his bet on match:\n${printOdds(chosenOffer)}\n\nReturned **${activeBet.amount}💎**`,
    );
  },
};
