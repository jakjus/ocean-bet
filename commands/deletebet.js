const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../db')
const { printOdds } = require ('../utils')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('deletebet')
    .setDescription('Delete a Bet')
    .addStringOption(option =>
        option.setName('offer')
        .setDescription('Bet Offer to search for')
        .setRequired(true)
        .setAutocomplete(true)),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const myDb = await db.get(interaction.guildId)
        const choices = myDb.offers.filter(o => !o.locked).map(o => {
            return {uid: o.uid, text: printOdds(o).replaceAll('*','')}
        });
        const filtered = choices.filter(c => c.text.toLowerCase().includes(focusedValue.toLowerCase()));
        await interaction.respond(
            filtered.map(c => ({ name: c.text, value: c.uid })),
        );
    },
    async execute(interaction) {
        const offer = interaction.options.getString('offer')
        const myDb = await db.get(interaction.guildId)
        const chosenOffer = myDb.offers.find(o => o.uid == offer);
        let player = myDb.players.find(p => p.userId == interaction.user.id)
        if (!player) {
            myDb.players.push({ userId: interaction.user.id, bets: [], balance: 0})
            await interaction.reply({ content: `You don't have ${amount}💎.\nYour current balance is 0💎.`, ephemeral: true });
            return
        }
        if (!chosenOffer) {
            await interaction.reply({ content: `Bet Offer not found.`, ephemeral: true });
            return
        }
        if (chosenOffer.locked) {
            await interaction.reply({ content: `This Bet Offer is locked.`, ephemeral: true });
            return
        }
        const activeBet = player.bets.find(b => chosenOffer.uid == b.offerUid)
        if (!activeBet) {
            await interaction.reply({ content: `You don't have active bet on this offer.`, ephemeral: true });
            return
        }
        player.balance += activeBet.amount
        player.bets = player.bets.filter(b => b.uid != chosenOffer.uid)
        db.set(interaction.guildId, myDb)
        await interaction.reply(`${interaction.user} has deleted his bet on match:\n${printOdds(chosenOffer)}\n\nReturned **${activeBet.amount}💎**`);
    },
};
