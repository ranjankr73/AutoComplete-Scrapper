# Autocomplete API Scraper

*Extracting all possible names from the API at `http://35.200.185.69:8000`*


## 1. Introduction

This project is designed to extract all possible names from an undocumented autocomplete API. Since the API's behavior is unknown, we explored and analyzed it systematically to retrieve maximum possible data.

## 2. API Exploration

We started by testing the API with basic queries to understand its behavior.

### Endpoint Discovered

 - `GET /v1/autocomplete?query=<string>`

 - Example:
 ```
http://35.200.185.69:8000/v1/autocomplete?query=a
```
- Returns:
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

- Querying a **single character (`a-z`)** returns a list of names starting with that letter.
- Querying **longer prefixes (`ab`, `ali`)** refines the suggestions.
- The API likely has a limit on how many results it returns per request.
- **Rate limiting** is enforced with HTTP **429 Too Many Requests** errors.

## 3. Approaches Tried

### Approach 1: Brute Force (Single Character Query)

- Queried `a-z` to get names for each letter.
- **Issue**: Not all names are retrieved (e.g., querying `a` may miss `Aaron` if the API limits results).

## 4. Implementation

### Setup
1. Install dependencies:
 ``` npm install axios ```
 
 2. Run the script: 
 ``` node scraper.js ```