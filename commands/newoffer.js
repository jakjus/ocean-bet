const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { db } = require('../db')
const { printOffers, printOdds } = require('../utils')
const { uid } = require('uid/secure')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('newoffer')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDescription('Create a New Bet Offer')
    .addStringOption(option =>
        option.setName('team1name')
        .setDescription('Team 1 Name')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('team2name')
        .setDescription('Team 2 Name')
        .setRequired(true))
    .addIntegerOption(option =>
        option.setName('team1win')
        .setDescription('Team 1 Win %')
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(true))
    .addIntegerOption(option =>
        option.setName('draw')
        .setDescription('Draw % (Skip, if no draw)')
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(false))
    .addIntegerOption(option =>
        option.setName('vigorish')
        .setDescription('Vigorish (Bookmaker Margin %)')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(false)),
    async execute(interaction) {
        const team1name = interaction.options.getString('team1name')
        const team2name = interaction.options.getString('team2name')
        const team1win = interaction.options.getInteger('team1win')
        const draw = interaction.options.getInteger('draw') || 0
        const vigorish = interaction.options.getInteger('vigorish') === null ? 3 : interaction.options.getInteger('vigorish')
        // Calculate returns
        const team2win = 100-team1win-draw
        const team1ret = Math.round((100/team1win)*(1-vigorish*0.01)*100)/100
        const team2ret = Math.round((100/team2win)*(1-vigorish*0.01)*100)/100
        const drawret = draw != 0 ? Math.round((100/draw)*(1-vigorish*0.01)*100)/100 : 0
        const myDb = await db.get(interaction.guildId)
        const newOffer = {uid: uid(), team1name, team2name, team1ret, team2ret, drawret, vigorish}
        await db.set(interaction.guildId, {...myDb, offers: [...myDb.offers, newOffer]})
        const changedDb = await db.get(interaction.guildId)
        await interaction.reply(`Added:\n${printOdds(newOffer)}\n\nCurrent Offers:\n${printOffers(changedDb.offers)}`)
    },
};
