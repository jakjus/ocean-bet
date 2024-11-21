const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");
const { printOdds } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deleteoffer")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDescription("[ADMIN] Delete a Bet Offer")
    .addStringOption((option) =>
      option
        .setName("offer")
        .setDescription("Bet Offer to search for")
        .setAutocomplete(true),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const myDb = (await db.get(interaction.guildId)) || {
      offers: [],
      players: [],
    };
    const choices = myDb.offers
      .filter((o) => !o.ended)
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
    const myDb = (await db.get(interaction.guildId)) || {
      offers: [],
      players: [],
    };
    const toDelete = myDb.offers
      .filter((o) => !o.ended)
      .find((o) => o.uid == offer);
    myDb.players.forEach((p) => {
      const ret = p.bets
        .filter((betgroup) =>
          betgroup.combination.some((b) => b.offerUid == offer),
        )
        .map((b) => b.amount)
        .reduce((a, v) => a + v, 0);
      p.balance += ret;
      p.bets = p.bets.filter((b) => b.offerUid != offer);
      interaction.channel.send(
        `Deleted Bet of <@${p.userId}>}:\n${printOdds(toDelete)}`,
      );
    });
    toDelete.ended = true;
    db.set(interaction.guildId, myDb);
    await interaction.reply(`Deleted Offer:\n${printOdds(toDelete)}`);
  },
};
