const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");
const { printOdds } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDescription("Announce Offer Result")
    .addStringOption((option) =>
      option
        .setName("offer")
        .setDescription("Bet Offer to search for")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("result")
        .setDescription("Result")
        .setRequired(true)
        .addChoices(
          { name: "Team 1 Win", value: "team1win" },
          { name: "Team 2 Win", value: "team2win" },
          { name: "Draw", value: "draw" },
        ),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const myDb = await db.get(interaction.guildId);
    const choices = myDb.offers.map((o) => {
      return { uid: o.uid, text: printOdds(o).replaceAll("*", "") };
    });
    const filtered = choices.filter((c) =>
      c.text.toLowerCase().includes(focusedValue.toLowerCase()),
    );
    await interaction.respond(
      filtered.map((c) => ({ name: c.text, value: c.uid })),
    );
  },
  async execute(interaction) {
    const offer = interaction.options.getString("offer");
    const result = interaction.options.getString("result");
    const myDb = await db.get(interaction.guildId);
    const chosenOffer = myDb.offers.find((o) => o.uid == offer);
    const affectedPlayerBetgroup = [];  // player, betgroup
    const payout = (player, betgroup) => {
    }

    if (!chosenOffer) {
      await interaction.reply({
        content: `Bet Offer not found.`,
        ephemeral: true,
      });
      return;
    }

    myDb.players.forEach((p) => {
      p.bets.forEach(betgroup => {
        const betOfThisOffer = betgroup.combination.find(b => b.offerUid == offer)
        if (betOfThisOffer) {
          if (betOfThisOffer[chosenOpt] == result) {
            betOfThisOffer.success = true
            affectedPlayerBetgroup.push({player: p, betgroup: betgroup})
            if (!betgroup.combination.some(b => b.success === undefined)) {
              // if all success
              payout(p, betgroup)
            }
          } else {
            betOfThisOffer.success = false
            affectedPlayerBetgroup.push({player: p, betgroup: betgroup})
            p.bets = p.bets.filter(_betgroup => _betgroup.uid != betgroup.uid)
          }
        }
      })
    })
    toChosenString = {
      team1win: chosenOffer["team1name"],
      team2win: chosenOffer["team2name"],
      draw: "Draw",
    };
    const winners = affectedPlayerBetgroup
      .sort((a, b) => b.combination.filter(bb => bb.success).length - a.combination.filter(bb => bb.success).length)
      .map(
        (w) =>
          `${interaction.guild.members.cache.get(w.player.userId)}: **${w.ret}💎**`,
      )
      .join("\n");
    myDb.offers = myDb.offers.filter((o) => o.uid != chosenOffer.uid);
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `${interaction.user} has announced result on offer:\n${printOdds(chosenOffer)}\nResult: **${toChosenString[result]}**\n\nWinners:\n${winners}`,
    );
  },
};
