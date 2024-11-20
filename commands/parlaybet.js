const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { printOdds, printAllBet } = require("../utils");
const { prevbetAutocomplete } = require("./common/prevbetAutocomplete")

const betToOffer = b => myDb.offers.find((o) => b.offerUid == o.uid)

module.exports = {
  data: new SlashCommandBuilder()
    .setName("parlaybet")
    .setDescription("Add a Bet to your existing bet, creating a parlay (combo bet)")
    .addStringOption((option) =>
      option
        .setName("prevbet")
        .setDescription("Your EXISTING bet (to add parlay to)")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("offer")
        .setDescription("New Bet Offer")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Bet")
        .setRequired(true)
        .addChoices(
          { name: "Team 1 Win", value: "team1win" },
          { name: "Team 2 Win", value: "team2win" },
          { name: "Draw", value: "draw" },
        ),
    )
  ,
  async autocomplete(interaction) {
    const myDb = await db.get(interaction.guildId);
    const field = interaction.options.getFocused(true)
    const player = myDb.players.find((p) => p.userId == interaction.user.id);

    if (!player) {
      myDb.players.push({ userId: interaction.user.id, bets: [], balance: 0 });
      await interaction.reply({
        content: `Create a bet with **/bet** first.`,
        ephemeral: true,
      });
      return;
    }

    if (field.name == 'prevbet') {
      prevbetAutocomplete(interaction, myDb, player, field)
      return
    }

    if (field.name == 'offer') {
      const choices = myDb.offers
        .filter((o) => !o.locked)
        .map((o) => {
          return { uid: o.uid, text: printOdds(o).replaceAll("*", "") };
        });
      const filtered = choices.filter((c) =>
        c.text.toLowerCase().includes(field.value.toLowerCase()),
      );
      await interaction.respond(
        filtered.map((c) => ({ name: c.text, value: c.uid })),
      );
      return
    }
  },
  async execute(interaction) {
    const offer = interaction.options.getString("offer");
    const amount = interaction.options.getInteger("amount");
    const choice = interaction.options.getString("choice");
    const prevBetgroupUid = interaction.options.getString("prevbet");
    const myDb = await db.get(interaction.guildId);
    const chosenOffer = myDb.offers.find((o) => o.uid == offer);
    let player = myDb.players.find((p) => p.userId == interaction.user.id);
    if (!player) {
      myDb.players.push({ userId: interaction.user.id, bets: [], balance: 0 });
      await interaction.reply({
        content: `You don't have ${amount}💎.\nYour current balance is 0💎.`,
        ephemeral: true,
      });
      return;
    }
    if (!chosenOffer) {
      await interaction.reply({
        content: `Bet Offer not found.`,
        ephemeral: true,
      });
      return;
    }
    if (chosenOffer.locked) {
      await interaction.reply({
        content: `This Bet Offer is locked.`,
        ephemeral: true,
      });
      return;
    }
    toRetKey = { team1win: "team1ret", team2win: "team2ret", draw: "drawret" };
    toChosenString = {
      team1win: chosenOffer["team1name"],
      team2win: chosenOffer["team2name"],
      draw: "Draw",
    };
    player.balance -= amount;
    const betgroupToAddTo = player.bets.find(betgroup => betgroup.uid == prevBetgroupUid)
    betgroupToAddTo.push({
      offerUid: chosenOffer.uid,
      chosenOpt: choice
    });
    db.set(interaction.guildId, myDb);
    const possibleReturn =
      Math.round(chosenOffer[toRetKey[choice]] * amount * 10) / 10;

    const printAllBet = betgroup => betgroup.combination.map(b => printOdds(betToOffer(b), b.chosenOpt))
    await interaction.reply(
      `${interaction.user} has added match to parlay:\n${printOdds(chosenOffer)}\nChoices: **${toChosenString[choice]}** \nAll choices: **${printAllBet(betgroupToAddTo)}**\nPossible return: **${possibleReturn}💎**`,
    );
  },
};
