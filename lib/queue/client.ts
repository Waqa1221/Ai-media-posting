import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";

let redis: Redis | null = null;
let isRedisAvailable = false;

// Try to connect to Redis with timeout
try {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 1,

    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 1000,
    commandTimeout: 1000,
  });

  // Handle Redis connection events
  redis.on("connect", () => {
    isRedisAvailable = true;
    // Silently handle successful connections
  });

  redis.on("error", (err) => {
    isRedisAvailable = false;
    // Silently handle Redis connection errors to avoid spam
  });

  redis.on("close", () => {
    isRedisAvailable = false;
    // Silently handle Redis connection close to avoid spam
  });
} catch (error) {
  console.warn("Redis not available, queue operations will be disabled");
  isRedisAvailable = false;
}

// Queue definitions
export const postSchedulingQueue = redis
  ? new Queue("post-scheduling", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    })
  : null;

export const analyticsQueue = redis
  ? new Queue("analytics", {
      connection: redis,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: "fixed",
          delay: 10000,
        },
        removeOnComplete: 50,
        removeOnFail: 25,
      },
    })
  : null;

export const aiGenerationQueue = redis
  ? new Queue("ai-generation", {
      connection: redis,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 10,
        removeOnFail: 10,
      },
    })
  : null;

// Job data types
export interface PostSchedulingJobData {
  postId: string;
  userId: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  scheduledFor: string;
}

export interface AnalyticsJobData {
  userId: string;
  postId?: string;
  platform?: string;
  metrics: Record<string, number>;
}

export interface AIGenerationJobData {
  userId: string;
  type: "text" | "image" | "video" | "caption" | "hashtags";
  prompt: string;
  model?: string;
}

// Helper functions to add jobs
export async function schedulePost(data: PostSchedulingJobData) {
  if (!postSchedulingQueue || !isRedisAvailable) {
    console.warn("Queue not available, skipping post scheduling");
    return null;
  }

  try {
    const delay = new Date(data.scheduledFor).getTime() - Date.now();

    return await postSchedulingQueue.add("publish-post", data, {
      delay: Math.max(0, delay),
      jobId: `post-${data.postId}-${data.platform}`,
    });
  } catch (error) {
    console.warn("Failed to schedule post, Redis may not be available:", error);
    throw error;
  }
}

export async function collectAnalytics(data: AnalyticsJobData) {
  if (!analyticsQueue || !isRedisAvailable) {
    console.warn("Queue not available, skipping analytics collection");
    return null;
  }

  try {
    return await analyticsQueue.add("collect-metrics", data);
  } catch (error) {
    console.warn(
      "Failed to queue analytics collection, Redis may not be available:",
      error
    );
    throw error;
  }
}

export async function generateAIContent(data: AIGenerationJobData) {
  if (!aiGenerationQueue || !isRedisAvailable) {
    console.warn("Queue not available, skipping AI generation");
    return null;
  }

  try {
    return await aiGenerationQueue.add("generate-content", data, {
      priority: 1, // High priority for AI generations
    });
  } catch (error) {
    console.warn(
      "Failed to queue AI generation, Redis may not be available:",
      error
    );
    throw error;
  }
}

// Cleanup function
export async function cleanupQueues() {
  if (!isRedisAvailable) {
    console.warn("Redis not available, skipping queue cleanup");
    return;
  }

  try {
    if (postSchedulingQueue) {
      await postSchedulingQueue.clean(24 * 60 * 60 * 1000, 100, "completed");
      await postSchedulingQueue.clean(7 * 24 * 60 * 60 * 1000, 50, "failed");
    }
    if (analyticsQueue) {
      await analyticsQueue.clean(24 * 60 * 60 * 1000, 50, "completed");
    }
    if (aiGenerationQueue) {
      await aiGenerationQueue.clean(60 * 60 * 1000, 10, "completed");
    }
  } catch (error) {
    console.warn(
      "Failed to cleanup queues, Redis may not be available:",
      error
    );
  }
}

export { redis };
