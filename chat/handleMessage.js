const { db } = require("../db");

let cooldowns = new Set();
exports.handleMessage = async (message) => {
  if (message.author.bot) {
    return;
  }
  const myDb = await db.get(message.guildId);
  const userId = message.author.id;
  if (myDb.reward == 0) {
    return;
  }
  if (!cooldowns.has(userId)) {
    cooldowns.add(userId);
    setTimeout(() => cooldowns.delete(userId), 8000);
    if (Math.random() < 0.02) {
      let player = myDb.players.find((p) => p.userId == userId);
      if (!player) {
        player = { userId, bets: [], balance: 0 };
        myDb.players.push(player);
      }
      if (myDb.reward === undefined) {
        myDb.reward = 10;
      }
      let amount = Math.round(myDb.reward * 0.5 + Math.random() * myDb.reward);

      player.balance += amount;
      player.balance = Math.round(player.balance * 10) / 10;
      try {
        await message.reply(
          `🎁 You got **${amount}💎** for chatting.\nCheck your balance with **/balance**`,
        );
      } catch (e) {
        console.log(`Error when sending message: ${e}`)
      }
      db.set(message.guildId, myDb);
    }
  }
};
