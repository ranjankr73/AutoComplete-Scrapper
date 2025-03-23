import axios from 'axios';
import { TokenBucket } from './RateLimiter.js';

const API_URL = 'http://35.200.185.69:8000/v1/autocomplete?query=';
const discoveredNames = new Set();

const tokenBucketRateLimiter = new TokenBucket(100, 60000);

async function fetchNames(query, attempt=1) {
    try {
        await tokenBucketRateLimiter.waitForToken();
        const response = await axios.get(API_URL + query);
    
        const results = response.data?.results || [];
        results.forEach(name => discoveredNames.add(name));
        
        console.log(`Success: ${query}`);

        return results.length > 0;

    } catch (error) {
        if (error.response?.status === 429) {
            let delay = 2000 * Math.pow(2, attempt - 1);
            console.warn(`Rate limit hit for '${query}'. Retrying in ${(delay) / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchNames(query, attempt+1);
        } else {
            console.error(`Error fetching '${query}':`, error.response ? error.response : error);
            return false;
        }
    }
}

export { fetchNames, discoveredNames };