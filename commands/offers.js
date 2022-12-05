const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../db')
const { printOffers } = require ('../utils')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('offers')
    .setDescription('Show all Bet Offers'),
    async execute(interaction) {
        const myDb = await db.get(interaction.guildId)
        if (myDb.offers?.length > 0) {
            await interaction.reply(`Current Offers:\n${printOffers(myDb.offers)}`)
        } else {
            await interaction.reply(`There are no active offers.\nAdmin may add an offer with **/newoffer**`)
        }
    },
};
