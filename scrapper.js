const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://35.200.185.69:8000/v1/autocomplete?query=';
const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';
const discoveredNames = new Set();

async function fetchNames(query) {
    try {
        const response = await axios.get(API_URL + query);
        if (response.data && Array.isArray(response.data.results)) {
            response.data.results.forEach(name => discoveredNames.add(name));
        }
    } catch (error) {
        console.error(`Error fetching '${query}':`, error.response ? error.response.data : error.message);
    }
}

async function exploreAPI() {
    for (const char of CHARACTERS) {
        console.log(`Fetching names for '${char}'`);
        await fetchNames(char);
    }
    
    console.log(`Total names discovered: ${discoveredNames.size}`);
    fs.writeFileSync('names.json', JSON.stringify([...discoveredNames], null, 2));
    console.log('Names saved to names.json');
}

exploreAPI();
