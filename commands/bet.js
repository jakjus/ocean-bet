const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { printOdds } = require("../utils");
const { uid } = require("uid/secure");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bet")
    .setDescription("Make a Bet")
    .addStringOption((option) =>
      option
        .setName("offer")
        .setDescription("Bet Offer to search for")
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
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount to Bet")
        .setMinValue(1)
        .setRequired(true),
    ),
  async autocomplete(interaction) {
    const field = interaction.options.getFocused(true)
    const myDb = await db.get(interaction.guildId);
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
  },
  async execute(interaction) {
    const offer = interaction.options.getString("offer");
    const amount = interaction.options.getInteger("amount");
    const choice = interaction.options.getString("choice");
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
    if (player.balance < amount) {
      await interaction.reply({
        content: `You don't have ${amount}💎.\nYour current balance is ${player.balance}💎.`,
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
    player.bets.push({
      amount,
      uid: uid(),
      combination: [{
        offerUid: chosenOffer.uid,
        chosenOpt: choice
      }]
    });
    db.set(interaction.guildId, myDb);
    const possibleReturn =
      Math.round(chosenOffer[toRetKey[choice]] * amount * 10) / 10;
    await interaction.reply(
      `${interaction.user} has bet **${amount}💎** on match:\n${printOdds(chosenOffer)}\nChoice: **${toChosenString[choice]}**\nPossible return: **${possibleReturn}💎**`,
    );
  },
};
