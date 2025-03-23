import fs from 'fs';
import { fetchNames, discoveredNames, leakyBucketRateLimiter } from './fetchNames.js';

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';
let nextQueue = CHARACTERS.split('');

function addCharToQuery(query){
    for(const char of CHARACTERS){
        nextQueue.push(query + char);
    }
}

function writeInfoToFile(version, rateLimiter, algorithm, queryLength, timeTaken, size, totalNames){
    let content = [];
    const fileData = fs.readFileSync('./names/info.json', 'utf-8');
    content = JSON.parse(fileData);

    if(!Array.isArray(content)){
        content = [];
    }

    content.push({
        version: version,
        rate_limiter: rateLimiter,
        algorithm: algorithm,
        query_length: queryLength,
        time_taken: timeTaken,
        no_of_requests: size,
        total_names: totalNames,
    });

    fs.writeFileSync('./names/info.json', JSON.stringify(content, null, 2));
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
        const timeTaken = leakyBucketRateLimiter.getTimeTakenToProcess();

        console.info(`Time taken to process query of length ${queryLength}: ${timeTaken}ms`);
        
        fs.writeFileSync('./names/v1_leaky_bucket_bfs.json', JSON.stringify([...discoveredNames], null, 2));

        writeInfoToFile('v1', 'Leaky Bucket', 'BFS', queryLength, timeTaken, size, discoveredNames.size);

        queryLength++;

        console.log(`Saved ${discoveredNames.size} names. Moving to length ${queryLength}...`);
    }

    if (nextQueue.length === 0) {
        console.log("No more queries to expand. Stopping.");
    }

    console.log(`Total names discovered: ${discoveredNames.size}`);
}

exploreAPI();