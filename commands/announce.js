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
    //let player = myDb.players.find(p => p.userId == interaction.user.id)
    let wins = [];
    myDb.players.forEach((p) => {
      let amt = p.bets.find(
        (b) => b.offerUid == offer && b.chosenOpt == result,
      )?.amount;
      if (amt) {
        toRetKey = {
          team1win: "team1ret",
          team2win: "team2ret",
          draw: "drawret",
        };
        let ret = Math.round(amt * chosenOffer[toRetKey[result]] * 10) / 10;
        wins.push({ p, ret });
        p.balance += Math.round(ret * 10) / 10;
        p.balance = Math.round(p.balance * 10) / 10;
        p.bets = p.bets.filter((b) => b.offerUid != offer);
      }
    });
    if (!chosenOffer) {
      await interaction.reply({
        content: `Bet Offer not found.`,
        ephemeral: true,
      });
      return;
    }
    toChosenString = {
      team1win: chosenOffer["team1name"],
      team2win: chosenOffer["team2name"],
      draw: "Draw",
    };
    let winners = wins
      .sort((a, b) => b.ret - a.ret)
      .map(
        (w) =>
          `${interaction.guild.members.cache.get(w.p.userId)}: **${w.ret}💎**`,
      )
      .join("\n");
    myDb.offers = myDb.offers.filter((o) => o.uid != chosenOffer.uid);
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `${interaction.user} has announced result on offer:\n${printOdds(chosenOffer)}\nResult: **${toChosenString[result]}**\n\nWinners:\n${winners}`,
    );
  },
};
