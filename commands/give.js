const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../db')
const { printOffers } = require ('../utils')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('admingive')
    .setDescription('Give 💎 to player (ADMIN only)')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('User to give 💎 to')
        .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user')
        console.log(user)
        const myDb = await db.get(interaction.guildId)
        //myDb.players.find(p => p.m
        await interaction.reply(`Current Offers:\n${printOffers(myDb.offers)}`)
    },
};
