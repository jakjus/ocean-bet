const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../db')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Check TOP 15 in this Server'),
    async execute(interaction) {
        const myDb = await db.get(interaction.guildId)
        let playersS = myDb.players.sort((a, b) => b.balance - a.balance).slice(0,15).map((v, i) => `${i+1}. ${interaction.guild.members.cache.get(v.userId)} **${v.balance}💎**`).join('\n')
        await interaction.reply(`🏆 **Leaderboards**\n${playersS}`)
    },
};
