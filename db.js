const Keyv = require('keyv');
const keyv = new Keyv('sqlite://db.sqlite');
keyv.on('error', err => console.error('Keyv connection error:', err));
exports.db = keyv
