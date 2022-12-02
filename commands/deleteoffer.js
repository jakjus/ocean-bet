const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../db')
const { printOffers, printOdds } = require ('../utils')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('deleteoffer')
    .setDescription('Delete a Bet Offer')
    .addStringOption(option =>
        option.setName('offer')
        .setDescription('Bet Offer to search for')
        .setAutocomplete(true)),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const myDb = await db.get(interaction.guildId) || {offers: [], players: []}
        const choices = myDb.offers.map(o => {
            return {uid: o.uid, text: printOdds(o).replaceAll('*','')}
        });
        const filtered = choices.filter(c => c.text.toLowerCase().includes(focusedValue.toLowerCase()));
        await interaction.respond(
            filtered.map(c => ({ name: c.text, value: c.uid })),
        );
    },
    async execute(interaction) {
        const offer = interaction.options.getString('offer')
        const myDb = await db.get(interaction.guildId) || {offers: [], players: []}
        const toDelete = myDb.offers.find(o => o.uid == offer);
        const newOffers = myDb.offers.filter(o => o.uid != offer);
        if (!toDelete) {
            await interaction.reply(`ERROR during deleting:\n${printOdds(offer)}`);
            return
        }
        db.set(interaction.guildId, {offers: newOffers, players: myDb.players})
        await interaction.reply(`Deleted Offer:\n${printOdds(toDelete)}`);
    },
};
