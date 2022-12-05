const printOffers = offers => offers.map((o, i) => `${i+1}. ${printOdds(o)}${o.locked ? ' 🔒':''}`).join('\n')

const printOdds = o => {
    return `**${o.team1name}** *(${o.team1ret})* - ${o.drawret == 0 ? '' : '*(Draw: '+o.drawret+')* - '}**${o.team2name}** *(${o.team2ret})*`
}

module.exports = { printOffers, printOdds }
