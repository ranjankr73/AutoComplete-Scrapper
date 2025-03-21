const RateLimiter = require('./RateLimiter');

const API_URL = 'http://35.200.185.69:8000/v1/autocomplete?query=';
const discoveredNames = new Set();
const rateLimiter = new RateLimiter(100, 60000);

async function fetchNames(query, attempt = 1) {
    try {
        await rateLimiter.waitForToken();
        const response = await axios.get(API_URL + query);
        
        if (response.data && Array.isArray(response.data.results)) {
            response.data.results.forEach(name => discoveredNames.add(name));
        }

        console.log(`Success: ${query}`);

    } catch (error) {

        if (error.response?.status === 429 && attempt <= 5) {
            
            let delay = 2000 * Math.pow(2, attempt - 1);
            console.warn(`Rate limit hit for '${query}'. Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchNames(query, attempt + 1);

        } else {
            console.error(`Error fetching '${query}':`, error.response ? error.response.data : error.message);
        }
    }
};

module.exports = { fetchNames, discoveredNames };