import axios from 'axios';
import { TokenBucket, LeakyBucket } from './RateLimiter.js';

const API_URL = 'http://35.200.185.69:8000/v1/autocomplete?query=';
const discoveredNames = new Set();

// const tokenBucketRateLimiter = new TokenBucket(100, 60000);
const leakyBucketRateLimiter = new LeakyBucket(1000, 100);

async function fetchNames(query, attempt=1) {
    try {
        // await tokenBucketRateLimiter.waitForToken();
        // const response = await axios.get(API_URL + query);

        const response = await leakyBucketRateLimiter.addRequest(() => 
            axios.get(API_URL + query));
    
        if (response.data && Array.isArray(response.data.results)) {
            response.data.results.forEach(name => discoveredNames.add(name));
        }
        
        console.log(`Success: ${query}`);

        return response.data.results.length > 0;

    } catch (error) {
        if(error.message === 'Bucket overflow'){
            const delay = 5000 * Math.pow(2, attempt-1);
            console.warn(`Rate limit overflow for ${query}. Retrying in ${delay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchNames(query, attempt + 1);
        }else if (error.response?.status === 429) {
            const delay = 2000 * Math.pow(2, attempt - 1);
            console.warn(`API rate limit hit. Retrying ${query} in ${delay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchNames(query, attempt+1);
        } else {
            console.error(`Error fetching '${query}':`, error.response ? error.response : error);
            return false;
        }
    }
}

export { fetchNames, discoveredNames, leakyBucketRateLimiter };