# Autocomplete API Scraper

*Extracting all possible names from the API at `http://35.200.185.69:8000`*


## 1. Introduction

This project is designed to extract all possible names from an undocumented autocomplete API. Since the API's behavior is unknown, we systematically explored and analyzed it to retrieve the maximum possible data.

## 2. API Exploration

We started by testing the API with basic queries to understand its behavior.

### Discovered Endpoint

 - Endpoint:
 `GET /v1/autocomplete?query=<string>`

 - Example:
`http://35.200.185.69:8000/v1/autocomplete?query=a`

- Example Response:
 ```
{
  "version": "v1",
  "count": 10,
  "results": [
    "aa",
    "aabdknlvkc",
    "aabrkcd",
    "aadgdqrwdy",
    "aagqg",
    "aaiha",
    "aainmxg",
    "aajfebume",
    "aajwv",
    "aakfubvxv"
  ]
}
```

- The API provides autocomplete suggestions based on the prefix.

### Findings

- Querying a **single character** (`a-z`) returns a list of names starting with that letter.
- Querying **longer prefixes** (`ab`, `ali`) refines the suggestions.
- The API likely has a **limit on the number of results per request**.
- **Rate limiting** is enforced with HTTP **429 Too Many Requests** errors.

## 3. Rate Limiting Strategies

- To avoid exceeding the API rate limit, I have implemented two rate-limiting strategies:
 
### 1. Token Bucket 
- A fixed number of tokens are added to the bucket at a steady rate.
- Each request consumes 1 token.
- If the bucket is empty, further requests are delayed until tokens are replenished.
- The refill rate is determined based on the API's rate limit.

### 2. Leaky Bucket 
- Requests are stored in a queue (bucket) and processed at a steady rate.
- If the queue is full, excess requests are dropped.
- The processing rate is determined by the API's rate limit.

## 3. Approaches Tried

### Approach 1: Brute Force (Single-Character Queries)

- Queried all 26 letters (`a-z`).
- **Result**: 10 names per letter.
- **Total Requests**: 26
- **Total Names Collected**: 260
- **Issue**: Not all names were retrieved.

### Approach 2: Double-Character Queries with Token Bucket Rate Limiter

- Queried all **676 combinations** (`aa-zz`).
- **Challenge**: Hit API rate limit (100 requests per minute).
- **Solution**: Implemented **Token Bucket Rate Limiter**.
- **Total Requests**: 676
- **Total Names Collected**: 6720

### Approach 2: Breadth-First Search (BFS) Expansion

- Queries were expanded dynamically by adding a character (`a-z`) if results existed.
- **Strategy**: Avoid unnecessary queries by expanding only prefixes that return results.
- **Experimented up to 2-character queries**.
- **Total Requests**: 676
- **Total Names Collected**: 6720
- **Issue**: Becomes too slow for longer query lengths.

## 4. Implementation

### Setup
1. Install dependencies:
 ``` npm install axios ```
 
 2. Run the script: 
 ``` node scraper.js ```
