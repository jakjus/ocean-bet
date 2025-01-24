const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { printOdds, getOrCreatePlayer } = require("../utils");
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
          { name: "Choice 1", value: "team1win" },
          { name: "Choice 2", value: "team2win" },
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
    const field = interaction.options.getFocused(true);
    const myDb = await db.get(interaction.guildId);
    const choices = myDb.offers
      .filter((o) => !o.locked)
      .filter((o) => !o.ended)
      .map((o) => {
        return { uid: o.uid, text: printOdds(o).replaceAll("*", "") };
      });
    const filtered = choices.filter((c) =>
      c.text.toLowerCase().includes(field.value.toLowerCase()),
    );
    await interaction.respond(
      filtered.map((c) => ({ name: c.text.slice(0,99), value: c.uid })),
    );
    return;
  },
  async execute(interaction) {
    const offer = interaction.options.getString("offer");
    const amount = interaction.options.getInteger("amount");
    const choice = interaction.options.getString("choice");
    const myDb = await db.get(interaction.guildId);
    const chosenOffer = myDb.offers.find((o) => o.uid == offer);
    const player = await getOrCreatePlayer(interaction, myDb);
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
    if (chosenOffer.ended) {
      await interaction.reply({
        content: `This Bet Offer has ended.`,
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
    if (!chosenOffer[toRetKey[choice]]) {
      await interaction.reply({
        content: `You cannot bet on this outcome.`,
        ephemeral: true,
      });
      return;
    }
    player.balance -= amount;
    player.bets.push({
      amount,
      uid: uid(),
      combination: [
        {
          offerUid: chosenOffer.uid,
          chosenOpt: choice,
        },
      ],
    });
    db.set(interaction.guildId, myDb);
    const possibleReturn =
      Math.round(chosenOffer[toRetKey[choice]] * amount * 10) / 10;
    await interaction.reply(
      `${interaction.user} has bet **${amount}💎** on match:\n${printOdds(chosenOffer)}\nChoice: **${toChosenString[choice]}**\nPossible return: **${possibleReturn}💎**`,
    );
  },
};
