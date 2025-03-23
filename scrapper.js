import fs from 'fs';
import { fetchNames, discoveredNames, leakyBucketRateLimiter } from './fetchNames.js';

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';
let nextQueue = CHARACTERS.split('');

function addCharToQuery(query){
    for(const char of CHARACTERS){
        nextQueue.push(query + char);
    }
}

async function exploreAPI() {
    discoveredNames.clear();

    let queryLength = 1;
    while(nextQueue.length > 0){
        let size = nextQueue.length;
        console.log(`Processing ${size} queries of length ${queryLength}...`);

        let tasks = [];
        for(let i=0; i<size; i++){
            const query = nextQueue.shift();
            const result = await fetchNames(query);
            tasks.push({result, query});
        }

        await Promise.all(tasks);

        tasks.map((task) => {
            if(task.result == true){
                addCharToQuery(task.query);
            }
        });

        tasks = [];
        console.info(`Time taken to process query of length ${queryLength}: ${leakyBucketRateLimiter.getTimeTakenToProcess()}ms`);
        queryLength++;
        
        fs.writeFileSync('names_v1.json', JSON.stringify([...discoveredNames], null, 2));
        console.log(`Saved ${discoveredNames.size} names. Moving to length ${queryLength}...`);
    }

    if (nextQueue.length === 0) {
        console.log("No more queries to expand. Stopping.");
    }

    console.log(`Total names discovered: ${discoveredNames.size}`);
}

exploreAPI();