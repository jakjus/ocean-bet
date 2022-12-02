const { generateBracket, addScore } = require('../utils')
const { generate } = require ('../toimage')

const interaction = { 
    guildId: 0,
    reply: msg => console.log(`TEST: Replying ${msg}`) 
}

const db = {
    "0": { 
        "teams": [
        {name: 'a', seed: '1'},
        {name: 'b', seed: '2'},
        {name: 'c', seed: '3'},
        {name: 'd', seed: '4'},
        {name: 'e', seed: '5'},
        {name: 'f', seed: '6'},
        {name: 'g', seed: '7'},
        {name: 'h', seed: '8'},
        {name: 'i', seed: '9'},
        {name: 'j', seed: '10'},
    ]}
}

generateBracket(interaction, async bracket => {
    await addScore(1, 1, 2, 1, bracket)
    await addScore(1, 2, 1, 15, bracket)
    await addScore(2, 1, 3, 2, bracket)
    await addScore(2, 2, 1, 0, bracket)
    await addScore(2, 3, 5, 3, bracket)
    await addScore(3, 1, 1, 2, bracket)
    await addScore(3, 1, 0, 0, bracket)
    await generate({ columns: bracket }, 1)
}, db, 1)
