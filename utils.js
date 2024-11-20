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
    `${bold(o.team1name)} *(${o.team1ret})* - ${o.drawret == 0 ? "" : "*(Draw: " + o.drawret + ")* - "}${o.team2name} *(${o.team2ret})*`;
  } else if (choice == 'team2win') {
    `${o.team1name} *(${o.team1ret})* - ${o.drawret == 0 ? "" : "*(Draw: " + o.drawret + ")* - "}${bold(o.team2name)} *(${o.team2ret})*`;
  } else if (choice == 'draw') {
    `${o.team1name} *(${o.team1ret})* - ${o.drawret == 0 ? "" : `*(${bold('Draw')}: ` + o.drawret + ")* - "}${o.team2name} *(${o.team2ret})*`;
  }
};

const printAllBet = betgroup => betgroup.combination.map(b => printOdds(betToOffer(b), b.chosenOpt))


module.exports = { printOffers, printOdds, printAllBet };
