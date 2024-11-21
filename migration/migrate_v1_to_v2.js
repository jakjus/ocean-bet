const { db } = require("../db");
const fs = require("fs");
const { uid } = require("uid/secure");

(async () => {
  await fs.copyFileSync("./db.sqlite", "./db.sqlite.bkp");
  for await (const [guildId, data] of db.iterator()) {
    for await (let player of data.players) {
      const newBets = [];
      for (let b of player.bets) {
        const amount = b.amount;
        delete b["amount"];
        b.uid = uid();
        newBets.push({ uid: uid(), combination: [b], amount: amount });
      }
      player.bets = newBets;
    }
    await db.set(guildId, data);
  }
})();
