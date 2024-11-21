const { db } = require('../db')
const fs = require('fs');
const { uid } = require("uid/secure");

(async () => {
	await fs.copyFileSync('./db.sqlite', './db.sqlite.bkp')
	for await (const [guildId, data] of db.iterator()) {
		console.log('\n\n===== DATA ======')
		console.log(data)
		console.log('\n\n===== BETS ======')
		for await (let player of data.players) {
			if (player.bets.length == 0) {
				return
			}
			console.log('pb before', JSON.stringify(player.bets, null, 2))
			const newBets = []
			for (let b of player.bets) {
				const amount = b.amount
				delete b['amount']
				b.uid = uid()
				newBets.push([{uid: uid(), combination: [b], amount: amount}])
			}
			player.bets = newBets
			console.log('pb after', JSON.stringify(player.bets, null, 2))
		}
		await db.set(guildId, data)
	}
})()
