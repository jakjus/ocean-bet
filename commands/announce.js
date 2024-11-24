const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");
const {
  printOdds,
  printAllBet,
  betGroupToReturn,
  betGroupToReturnRatio,
} = require("../utils");

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
          { name: "Choice 1", value: "team1win" },
          { name: "Choice 2", value: "team2win" },
          { name: "Draw", value: "draw" },
        ),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const myDb = await db.get(interaction.guildId);
    const choices = myDb.offers
    .filter(o => !o.ended)
    .map((o) => {
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
    const affectedPlayerBetgroup = []; // player, betgroup, successNow

    const payout = (player, betgroup) => {
      const prize = betGroupToReturn(betgroup, myDb);
      player.balance += prize;
      player.balance = Math.round(player.balance * 10) / 10;
      interaction.channel.send(
        `<@${player.userId}> **wins ${prize}💎**! (${Math.round(betGroupToReturnRatio(betgroup, myDb) * 10) / 10}x)`,
      );
    };

    if (!chosenOffer) {
      await interaction.reply({
        content: `Bet Offer not found.`,
        ephemeral: true,
      });
      return;
    }

    myDb.players.forEach((p) => {
      p.bets.forEach((betgroup) => {
        const betOfThisOffer = betgroup.combination.find(
          (b) => b.offerUid == offer,
        );
        if (betOfThisOffer) {
          if (betOfThisOffer.chosenOpt == result) {
            betOfThisOffer.success = true;
            affectedPlayerBetgroup.push({
              player: p,
              betgroup: betgroup,
              successNow: true,
            });
            if (!betgroup.combination.some((b) => b.success === undefined)) {
              // if all success
              payout(p, betgroup);
              p.bets = p.bets.filter(
                (_betgroup) => _betgroup.uid != betgroup.uid,
              );
            }
          } else {
            betOfThisOffer.success = false;
            affectedPlayerBetgroup.push({
              player: p,
              betgroup: betgroup,
              successNow: false,
            });
            p.bets = p.bets.filter(
              (_betgroup) => _betgroup.uid != betgroup.uid,
            );
          }
        }
      });
    });
    toChosenString = {
      team1win: chosenOffer["team1name"],
      team2win: chosenOffer["team2name"],
      draw: "Draw",
    };
    const playerResults = affectedPlayerBetgroup
      .sort(
        (a, b) =>
          b.betgroup.combination.filter((bb) => bb.success).length -
          a.betgroup.combination.filter((bb) => bb.success).length,
      )
      .map((w) => {
        return `${interaction.guild.members.cache.get(w.player.userId)}\n${printAllBet(w.betgroup, myDb)}${w.successNow ? "" : "❌"}`;
      })
      .join("\n─────────────────────────────\n");
    chosenOffer.ended = true
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `${interaction.user} has announced result on offer:\n${printOdds(chosenOffer)}\nResult: **${toChosenString[result]}**\n\nPlayer Results:\n${playerResults}`,
    );
  },
};
