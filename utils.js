const { db } = require("./db");

const printOffers = (offers) =>
  offers
    .map((o, i) => `${i + 1}. ${printOdds(o)}${o.locked ? " 🔒" : ""}`)
    .join("\n");

const printOdds = (o, b) => {
  // there is some room for improvement but my head hurts doing this one
  const choice = b?.chosenOpt
  const success = b?.success
  const bold = s => `**${s}**`
  const successPart = () => success === true ? ` ✅` : success === false ? ` ❌` : ``
  const mainpart = () => {
    if (!choice) {
      return `**${o.team1name}** *(${o.team1ret})* - ${o.drawret == 0 ? "" : "*(Draw: " + o.drawret + ")* - "}**${o.team2name}** *(${o.team2ret})*`
    } else if (choice == 'team1win') {
      return `${bold(o.team1name)} *(${o.team1ret})* - ${o.drawret == 0 ? "" : "*(Draw: " + o.drawret + ")* - "}${o.team2name} *(${o.team2ret})*`;
    } else if (choice == 'team2win') {
      return `${o.team1name} *(${o.team1ret})* - ${o.drawret == 0 ? "" : "*(Draw: " + o.drawret + ")* - "}${bold(o.team2name)} *(${o.team2ret})*`;
    } else if (choice == 'draw') {
      return `${o.team1name} *(${o.team1ret})* - ${o.drawret == 0 ? "" : `*(${bold('Draw')}: ` + o.drawret + ")* - "}${o.team2name} *(${o.team2ret})*`;
    }
  }
  return mainpart()+successPart()
};

const printAllBet = (betgroup, myDb) => {
  return `Bet: **${betgroup.amount}💎**\n`+betgroup.combination.map((b, i) =>  {
    const offer = betToOffer(b, myDb)
    return `${i+1}. `+printOdds(offer, b)
  }).join('\n')+`\nPossible return:** ${betGroupToReturn(betgroup, myDb)}💎**`
}

const betToOffer = (b, myDb) => myDb.offers.find((o) => b.offerUid == o.uid)

const getOrCreatePlayer = async (interaction, myDb) => {
  const player = myDb.players.find((p) => p.userId == interaction.user.id);
  if (!player) {
    const initPlayer = { userId: interaction.user.id, bets: [], balance: 0 }
    myDb.players.push(initPlayer);
    return initPlayer
  } else {
    return player
  }
}

const t = {
  team1win: "team1ret",
  team2win: "team2ret",
  draw: "drawret"
}

const optionToReturn = (opt, offer) => {
  return offer[t[opt]]
}

const optionToChoiceName = (opt, offer) => {
  const n = {
    team1win: offer["team1name"],
    team2win: offer["team2name"],
    draw: "Draw"
  }
  return n[opt]
}

const betGroupToReturnRatio = (betgroup, myDb) => betgroup.combination.reduce((accumulator, b) => accumulator*optionToReturn(b.chosenOpt, betToOffer(b, myDb)), 1)

const betGroupToReturn = (betgroup, myDb) => Math.round(betGroupToReturnRatio(betgroup, myDb) * betgroup.amount * 10) / 10

const prevbetAutocomplete = async (interaction, myDb, player, field) => {
  const choicesNotLocked = player.bets
  .filter((betgroup) => !betgroup.combination
    .some(b => betToOffer(b, myDb).locked))  // dont show previous bets that are already locked
  const choices = choicesNotLocked.map((betgroup) => {
    return { uid: betgroup.uid, text: `[${betgroup.amount} 💎] ${betgroup.combination.map(b => optionToChoiceName(b.chosenOpt, betToOffer(b, myDb))).join('-')}`};
  });
  const filteredByText = choices.filter((c) =>
    c.text.toLowerCase().includes(field.value.toLowerCase()),
  );
  await interaction.respond(
    filteredByText.map((c) => ({ name: c.text, value: c.uid })),
  );
}

module.exports = { printOffers, printOdds, printAllBet, betToOffer, getOrCreatePlayer, betGroupToReturn,betGroupToReturnRatio, prevbetAutocomplete };
