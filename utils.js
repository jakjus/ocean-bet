const printOffers = (offers) =>
  offers
    .map((o, i) => `${i + 1}. ${printOdds(o)}${o.locked ? " 🔒" : ""}`)
    .join("\n");

const printOdds = (o, choice) => {
  // there is some room for improvement but my head hurts doing this one
  const bold = s => `**${s}**`
  if (!choice) {
    return `**${o.team1name}** *(${o.team1ret})* - ${o.drawret == 0 ? "" : "*(Draw: " + o.drawret + ")* - "}**${o.team2name}** *(${o.team2ret})*`
  } else if (choice == 'team1win') {
    return `${bold(o.team1name)} *(${o.team1ret})* - ${o.drawret == 0 ? "" : "*(Draw: " + o.drawret + ")* - "}${o.team2name} *(${o.team2ret})*`;
  } else if (choice == 'team2win') {
    return `${o.team1name} *(${o.team1ret})* - ${o.drawret == 0 ? "" : "*(Draw: " + o.drawret + ")* - "}${bold(o.team2name)} *(${o.team2ret})*`;
  } else if (choice == 'draw') {
    return `${o.team1name} *(${o.team1ret})* - ${o.drawret == 0 ? "" : `*(${bold('Draw')}: ` + o.drawret + ")* - "}${o.team2name} *(${o.team2ret})*`;
  }
};

const printAllBet = (betgroup, myDb) => {
  return `Amount: ${betgroup.amount}💎\n`+betgroup.combination.map((b, i) =>  {
    const offer = betToOffer(b, myDb)
    return `${i+1}. `+printOdds(offer, b.chosenOpt)
  }).join('\n')+`\nPossible return: `
}

const betToOffer = (b, myDb) => myDb.offers.find((o) => b.offerUid == o.uid)

const getOrCreatePlayer = async (interaction) => {
  const player = myDb.players.find((p) => p.userId == interaction.user.id);
  if (!player) {
    const initPlayer = { userId: interaction.user.id, bets: [], balance: 0 } 
    myDb.players.push(initPlayer);
    return initPlayer
  } else {
    return player
  }
}

const betGroupToReturn = (betgroup, myDb) => betgroup.combination.reduce((accumulator, b) => accumulator*optionToReturn(b.chosenOpt, betToOffer(b, myDb)), 1)

module.exports = { printOffers, printOdds, printAllBet, betToOffer, getOrCreatePlayer, betGroupToReturn };
