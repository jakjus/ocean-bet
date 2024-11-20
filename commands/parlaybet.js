const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { betGroupToReturn, printOdds, printAllBet, betToOffer, getOrCreatePlayer, prevbetAutocomplete  } = require("../utils");


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
    const player = await getOrCreatePlayer(interaction)

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
    const player = getOrCreatePlayer(interaction)
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
    const betgroupToAddTo = player.bets.find(betgroup => betgroup.uid == prevBetgroupUid)
    if (betgroupToAddTo.combination.find(b => betToOffer(b, myDb).uid == chosenOffer.uid)) {
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
    const optionToReturn = (opt, offer) => {
      const t = {
        team1win: "team1ret",
        team2win: "team2ret",
        draw: "drawret"
      }
      return offer[t[opt]]
    }
    console.log('bets',player.bets)
    console.log('prevbetgroupid', prevBetgroupUid)
    betgroupToAddTo.combination.push({
      offerUid: chosenOffer.uid,
      chosenOpt: choice
    });
    db.set(interaction.guildId, myDb);

    const possibleReturn = betGroupToReturn(betgroupToAddTo, myDb)
    const possibleReturnRounded = Math.round(possibleReturn * amount * 10) / 10

    await interaction.reply(
      `${interaction.user} has added match to parlay:\n${printOdds(chosenOffer)}\nChoices: **${toChosenString[choice]}** \nAll choices: \n${printAllBet(betgroupToAddTo, myDb)}\nPossible return: **${possibleReturnRounded}💎**`,
    );
  },
};
