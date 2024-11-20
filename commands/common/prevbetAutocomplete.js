const { db } = require("../../db");
const betToOffer = b => myDb.offers.find((o) => b.offerUid == o.uid)

exports.prevbetAutocomplete = async (interaction, myDb, player, field) => {
  console.log('player', JSON.stringify(player, null, 2))
  const choicesNotLocked = player.bets
  .filter((betgroup) => !betgroup.combination
    .some(b => betToOffer(b).locked))  // dont show previous bets that are already locked
  console.log('cho nl', choicesNotLocked)
  const choices = choicesNotLocked.map((betgroup) => {
    return { uid: betgroup.uid, text: `[${betgroup.amount} 💎] ${betgroup.combination.map(b => b.chosenOpt).join(' - ')}`};
  });
  console.log('choices', choices)
  const filteredByText = choices.filter((c) =>
    c.text.toLowerCase().includes(field.value.toLowerCase()),
  );
  await interaction.respond(
    filteredByText.map((c) => ({ name: c.text, value: c.uid })),
  );
}
