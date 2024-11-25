const { SlashCommandBuilder } = require("discord.js");
const { db } = require("../db");
const { printOffers } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("offers")
    .setDescription("Show all Bet Offers"),
  async execute(interaction) {
    const myDb = await db.get(interaction.guildId);
    if (myDb.offers?.filter((o) => !o.ended).length > 0) {
      const printArray = printOffers(myDb.offers)
      console.log(printArray)
      let toReply = `Current Offers:\n${printArray[0]}`

      await interaction.reply(toReply);
      for (let i = 1; i < printArray.length; i++) {
        await interaction.channel.send(printArray[i])
      }
    } else {
      await interaction.reply(
        `There are no active offers.\nAdmin may add an offer with **/newoffer**`,
      );
    }
  },
};
