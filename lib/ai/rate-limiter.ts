import { Redis } from "@upstash/redis";
import { Redis as IORedis } from "ioredis";
import { AI_CONFIG } from "./config";

class AIRateLimiter {
  private redis: Redis | IORedis;
  private isConnected: boolean = false;
  private connectionAttempted: boolean = false;
  private static instance: AIRateLimiter;

  private constructor() {
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN &&
      process.env.UPSTASH_REDIS_REST_URL.startsWith("https://") &&
      process.env.UPSTASH_REDIS_REST_URL !== "your_upstash_redis_url"
    ) {
      // Use Upstash Redis for production
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      this.isConnected = true;
    } else {
      // Use local Redis for development
      this.redis = new IORedis(
        process.env.REDIS_URL || "redis://localhost:6379",
        {
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 1000,
          commandTimeout: 1000,
        }
      );

      // Handle connection events
      this.redis.on("connect", () => {
        this.isConnected = true;
        this.connectionAttempted = true;
        console.log("Rate limiter Redis connected successfully");
      });

      this.redis.on("error", (err) => {
        this.isConnected = false;
        this.connectionAttempted = true;
        // Silently handle Redis connection errors to avoid spam
      });

      this.redis.on("close", () => {
        this.isConnected = false;
        this.connectionAttempted = true;
        // Silently handle Redis connection close to avoid spam
      });

      // Attempt initial connection with timeout
      this.attemptConnection();
    }
  }

  private async attemptConnection() {
    if (this.connectionAttempted) return;

    try {
      await (this.redis as IORedis).connect();
    } catch (error) {
      this.isConnected = false;
      this.connectionAttempted = true;
      // Silently handle connection failure
    }
  }

  static getInstance(): AIRateLimiter {
    if (!AIRateLimiter.instance) {
      AIRateLimiter.instance = new AIRateLimiter();
    }
    return AIRateLimiter.instance;
  }

  async checkLimit(userId: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: Date;
  }> {
    // If Redis is not connected, allow the request but with basic limits
    if (!this.isConnected) {
      console.warn("Redis not connected, allowing request with default limits");
      return {
        success: true,
        limit: AI_CONFIG.rateLimit.requests,
        remaining: AI_CONFIG.rateLimit.requests - 1,
        reset: new Date(Date.now() + AI_CONFIG.rateLimit.window * 1000),
      };
    }

    try {
      const key = `ai_generation:${userId}`;
      const window = AI_CONFIG.rateLimit.window;
      const limit = AI_CONFIG.rateLimit.requests;

      const now = Date.now();
      const windowStart = now - window * 1000;

      // Remove old entries
      await this.redis.zremrangebyscore(key, 0, windowStart);

      // Count current requests
      const current = await this.redis.zcard(key);

      if (current >= limit) {
        const oldestEntry = await this.redis.zrange(key, 0, 0, "WITHSCORES");
        const resetTime =
          oldestEntry.length > 0
            ? parseInt(oldestEntry[1] as string) + window * 1000
            : now + window * 1000;

        return {
          success: false,
          limit,
          remaining: 0,
          reset: new Date(resetTime),
        };
      }

      // Add current request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      await this.redis.expire(key, window);

      return {
        success: true,
        limit,
        remaining: limit - current - 1,
        reset: new Date(now + window * 1000),
      };
    } catch (error) {
      console.warn("Rate limit check error:", error);
      // On error, allow the request but log the issue
      return {
        success: true,
        limit: AI_CONFIG.rateLimit.requests,
        remaining: AI_CONFIG.rateLimit.requests - 1,
        reset: new Date(Date.now() + AI_CONFIG.rateLimit.window * 1000),
      };
    }
  }

  async getRemainingRequests(userId: string): Promise<number> {
    const result = await this.checkLimit(userId);
    return result.remaining;
  }

  async getResetTime(userId: string): Promise<Date> {
    const result = await this.checkLimit(userId);
    return result.reset;
  }
}

export const aiRateLimiter = AIRateLimiter.getInstance();
