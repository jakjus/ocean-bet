const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { db } = require("../db");
const { printOdds } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDescription("Unlock Offer (Allow new bets)")
    .addStringOption((option) =>
      option
        .setName("offer")
        .setDescription("Bet Offer to search for")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const myDb = await db.get(interaction.guildId);
    const choices = myDb.offers
      .filter((o) => o.locked)
      .filter((o) => !o.ended)
      .map((o) => {
        return { uid: o.uid, text: printOdds(o).replaceAll("*", "") };
      });
    const filtered = choices.filter((c) =>
      c.text.toLowerCase().includes(focusedValue.toLowerCase()),
    ).slice(0,24);
    await interaction.respond(
      filtered.map((c) => ({ name: c.text, value: c.uid })),
    );
  },
  async execute(interaction) {
    const offer = interaction.options.getString("offer");
    const myDb = await db.get(interaction.guildId);
    const chosenOffer = myDb.offers.find((o) => o.uid == offer);
    //let player = myDb.players.find(p => p.userId == interaction.user.id)
    if (!chosenOffer) {
      await interaction.reply({
        content: `Bet Offer not found.`,
        ephemeral: true,
      });
      return;
    }
    chosenOffer.locked = 0;
    db.set(interaction.guildId, myDb);
    await interaction.reply(
      `${interaction.user} has unlocked offer:\n${printOdds(chosenOffer)}\nYou can now make a bet or delete a bet on this offer.`,
    );
  },
};
