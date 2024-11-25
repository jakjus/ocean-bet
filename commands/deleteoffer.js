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
        .setRequired(true)
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
      filtered.map((c) => ({ name: c.text.slice(0,99), value: c.uid })),
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
      const betgroupsWithDeleted = p.bets
        .filter((betgroup) =>
          betgroup.combination.some((b) => b.offerUid == offer),
        )

      const ret = betgroupsWithDeleted
        .map((b) => b.amount)
        .reduce((a, v) => a + v, 0);
      p.balance += ret;
      p.bets = p.bets.filter((betgroup) =>
          !betgroup.combination.some((b) => b.offerUid == offer))

      if (ret > 0) {
        interaction.channel.send(
          `Deleted Bet of <@${p.userId}>:\n${printOdds(toDelete)} (returned ${ret}💎)`,
        );
      }
    });
    toDelete.ended = true;
    db.set(interaction.guildId, myDb);
    await interaction.reply(`Deleted Offer:\n${printOdds(toDelete)}`);
  },
};
