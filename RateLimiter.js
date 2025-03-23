export class TokenBucket {
    constructor(maxRequests, perMilliseconds) {
        this.maxRequests = maxRequests;
        this.perMilliseconds = perMilliseconds;
        this.tokens = maxRequests;
        this.lastRefill = Date.now();

        setInterval(() => this.refill(), perMilliseconds/maxRequests);
    }

    refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const newTokens = Math.floor(elapsed / (this.perMilliseconds / this.maxRequests));
        
        if (newTokens > 0) {
            this.tokens = Math.min(this.tokens + newTokens, this.maxRequests);
        this.lastRefill = now;
    }
    }

    async waitForToken() {
        while (this.tokens <= 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        this.tokens--;
    }
}

export class LeakyBucket {
    constructor(capacity, leakRatePerMin) {
        this.capacity = capacity;
        this.leakRatePerMs = leakRatePerMin / (60 * 1000);
        this.tokens = capacity;
        this.lastLeakTime = Date.now();
    }

    async addRequest(request) {
        const now = Date.now();
        const elapsed = now - this.lastLeakTime;
        
        this.tokens = Math.min(
            this.capacity,
            this.tokens + elapsed * this.leakRatePerMs
        );
        this.lastLeakTime = now;

        if (this.tokens >= 1) {
            this.tokens -= 1;
            return request();
        }
        
        throw new Error('Bucket overflow');
    }
}