const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const {
  betGroupToReturn,
  printOdds,
  printAllBet,
  betToOffer,
  getOrCreatePlayer,
  prevbetAutocomplete,
} = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("parlaybet")
    .setDescription(
      "Add a Bet to your existing bet, creating a parlay (combo bet)",
    )
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
          { name: "Choice 1", value: "team1win" },
          { name: "Choice 2", value: "team2win" },
          { name: "Draw", value: "draw" },
        ),
    ),
  async autocomplete(interaction) {
    const myDb = await db.get(interaction.guildId);
    const field = interaction.options.getFocused(true);
    const player = await getOrCreatePlayer(interaction, myDb);

    if (field.name == "prevbet") {
      prevbetAutocomplete(interaction, myDb, player, field);
      return;
    }

    if (field.name == "offer") {
      const prevbetUid = interaction.options.getString("prevbet");
      if (!prevbetUid) {
        return;
      }
      const betgroup = player.bets.find(
        (betgroup) => betgroup.uid == prevbetUid,
      );
      const prevbetHasOffer = (offer) =>
        betgroup?.combination.some((b) => betToOffer(b, myDb).uid == offer.uid);
      const choices = myDb.offers
        .filter((o) => !o.locked)
        .filter((o) => !o.ended)
        .filter((o) => !prevbetHasOffer(o))
        .map((o) => {
          return { uid: o.uid, text: printOdds(o).replaceAll("*", "") };
        });
      const filtered = choices.filter((c) =>
        c.text.toLowerCase().includes(field.value.toLowerCase())
      ).slice(0,24);
      await interaction.respond(
        filtered.map((c) => ({ name: c.text, value: c.uid })),
      );
      return;
    }
  },
  async execute(interaction) {
    const offer = interaction.options.getString("offer");
    const choice = interaction.options.getString("choice");
    const prevBetgroupUid = interaction.options.getString("prevbet");
    const myDb = await db.get(interaction.guildId);
    const player = await getOrCreatePlayer(interaction, myDb); // without myDb as argument, changes to player object do not get set when calling db.set
    const chosenOffer = myDb.offers.find((o) => o.uid == offer);
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
    const betgroupToAddTo = player.bets.find(
      (betgroup) => betgroup.uid == prevBetgroupUid,
    );
    if (
      betgroupToAddTo.combination.find(
        (b) => betToOffer(b, myDb).uid == chosenOffer.uid,
      )
    ) {
      await interaction.reply({
        content: `You cannot add the same bet to combination.`,
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
    if (!chosenOffer[toRetKey[choice]]) {
      await interaction.reply({
        content: `You cannot bet on this outcome.`,
        ephemeral: true,
      });
      return;
    }
    betgroupToAddTo.combination.push({
      offerUid: chosenOffer.uid,
      chosenOpt: choice,
    });
    db.set(interaction.guildId, myDb);

    await interaction.reply(
      `${interaction.user} has added match to *Parlay*:\n${printOdds(chosenOffer)}\nChoice: **${toChosenString[choice]}** \n\n### Current combination: \n${printAllBet(betgroupToAddTo, myDb)}`,
    );
  },
};
