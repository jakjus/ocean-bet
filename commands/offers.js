const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../db')
const { printOffers } = require ('../utils')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('offers')
    .setDescription('Show all Bet Offers'),
    async execute(interaction) {
        const myDb = await db.get(interaction.guildId)
        await interaction.reply(`Current Offers:\n${printOffers(myDb.offers)}`)
    },
};
