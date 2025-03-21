const fs = require('fs');
const { fetchNames, discoveredNames } = require('./fetchNames');

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';

async function exploreAPI() {
    const tasks = [];
    
    for (const char1 of CHARACTERS) {
        for (const char2 of CHARACTERS) {
            tasks.push(fetchNames(char1 + char2));
        }
    }

    await Promise.allSettled(tasks);

    console.log(`Total names discovered: ${discoveredNames.size}`);
    fs.writeFileSync('names.json', JSON.stringify([...discoveredNames], null, 2));
    console.log('Names saved to names.json');
}

exploreAPI();