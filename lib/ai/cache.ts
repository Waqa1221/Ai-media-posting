import { Redis } from "@upstash/redis";
import { Redis as IORedis } from "ioredis";
import { createHash } from "crypto";
import { AI_CONFIG } from "./config";
import type { ContentBrief, GeneratedContent } from "./types";

class AICache {
  private redis: Redis | IORedis;
  private isConnected: boolean = false;
  private connectionAttempted: boolean = false;
  private static instance: AICache;

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
          connectTimeout: 1000,
          commandTimeout: 1000,
        }
      );

      // Handle connection events
      this.redis.on("connect", () => {
        this.isConnected = true;
        this.connectionAttempted = true;
        console.log("Redis connected successfully");
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

  static getInstance(): AICache {
    if (!AICache.instance) {
      AICache.instance = new AICache();
    }
    return AICache.instance;
  }

  private generateCacheKey(brief: ContentBrief): string {
    const briefString = JSON.stringify(brief);
    const hash = createHash("sha256").update(briefString).digest("hex");
    return `${AI_CONFIG.cache.keyPrefix}${hash}`;
  }

  async get(brief: ContentBrief): Promise<GeneratedContent | null> {
    if (!this.isConnected) {
      console.warn("Redis not connected, skipping cache get");
      return null;
    }

    try {
      const key = this.generateCacheKey(brief);
      const cached = await this.redis.get(key);

      if (cached && typeof cached === "object") {
        return cached as GeneratedContent;
      }

      return null;
    } catch (error) {
      console.warn("Cache get error:", error);
      return null;
    }
  }

  async set(brief: ContentBrief, content: GeneratedContent): Promise<void> {
    if (!this.isConnected) {
      console.warn("Redis not connected, skipping cache set");
      return;
    }

    try {
      const key = this.generateCacheKey(brief);
      await this.redis.setex(key, AI_CONFIG.cache.ttl, JSON.stringify(content));
    } catch (error) {
      console.warn("Cache set error:", error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    if (!this.isConnected) {
      console.warn("Redis not connected, skipping cache invalidate");
      return;
    }

    try {
      const keys = await this.redis.keys(
        `${AI_CONFIG.cache.keyPrefix}${pattern}*`
      );
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.warn("Cache invalidate error:", error);
    }
  }

  async getStats(): Promise<{ hits: number; misses: number }> {
    if (!this.isConnected) {
      return { hits: 0, misses: 0 };
    }

    try {
      const hits = (await this.redis.get("cache:hits")) || 0;
      const misses = (await this.redis.get("cache:misses")) || 0;
      return { hits: Number(hits), misses: Number(misses) };
    } catch (error) {
      console.warn("Cache stats error:", error);
      return { hits: 0, misses: 0 };
    }
  }

  async incrementHits(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.redis.incr("cache:hits");
    } catch (error) {
      console.warn("Cache increment hits error:", error);
    }
  }

  async incrementMisses(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.redis.incr("cache:misses");
    } catch (error) {
      console.warn("Cache increment misses error:", error);
    }
  }
}

export const aiCache = AICache.getInstance();
