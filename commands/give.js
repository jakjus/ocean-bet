const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../db')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Give 💎 to player (ADMIN only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
        option.setName('user')
        .setDescription('User to give 💎 to')
        .setRequired(true))
    .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('Amount')
        .setMinValue(1)
        .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user')
        const amount = interaction.options.getInteger('amount')
        const myDb = await db.get(interaction.guildId)
        let player = myDb.players.find(p => p.userId == user.id)
        if (!player) {
            player = { userId: user.id, bets: [], balance: 0 }
            myDb.players.push(player)
        }
        player.balance += amount
        db.set(interaction.guildId, myDb)
        await interaction.reply(`[ADMIN] ${interaction.user} gave ${amount}💎 to ${user}.`)
    },
};
