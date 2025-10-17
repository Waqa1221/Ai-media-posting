import { TwitterApi } from "twitter-api-v2";
import type { SocialAccount, PublishResult } from "../types";

// Enhanced logging for Twitter platform operations
const logTwitterOperation = (operation: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[Twitter Platform ${timestamp}] ${operation}`,
    data ? JSON.stringify(data, null, 2) : ""
  );
};

export class TwitterPlatform {
  private client: TwitterApi;

  constructor(accessToken: string, accessSecret: string) {
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
      logTwitterOperation("Twitter API credentials not configured");
      throw new Error("Twitter API credentials not configured");
    }

    logTwitterOperation("Initializing Twitter platform client", {
      hasAccessToken: !!accessToken,
      hasAccessSecret: !!accessSecret,
      environment: process.env.NODE_ENV,
    });
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken,
      accessSecret,
    });
  }

  async validateConnection(): Promise<boolean> {
    try {
      logTwitterOperation("Validating Twitter connection");
      await this.client.v2.me();
      logTwitterOperation("Connection validation successful");
      return true;
    } catch (error: any) {
      logTwitterOperation("Connection validation failed", {
        error: error.message,
        code: error.code,
      });
      return false;
    }
  }

  async publishPost(
    content: string,
    mediaUrls?: string[]
  ): Promise<PublishResult> {
    try {
      logTwitterOperation("Starting tweet publication", {
        contentLength: content.length,
        mediaCount: mediaUrls?.length || 0,
      });

      // Validate content length for Twitter
      if (content.length > 280) {
        logTwitterOperation("Content length validation failed", {
          length: content.length,
        });
        return {
          success: false,
          error: "Tweet content exceeds 280 character limit",
        };
      }

      let mediaIds: string[] = [];

      // Upload media if provided
      if (mediaUrls && mediaUrls.length > 0) {
        if (mediaUrls.length > 4) {
          logTwitterOperation("Media count validation failed", {
            count: mediaUrls.length,
          });
          return {
            success: false,
            error: "Twitter supports maximum 4 media files per tweet",
          };
        }

        logTwitterOperation("Starting media upload", {
          mediaCount: mediaUrls.length,
        });

        for (const mediaUrl of mediaUrls) {
          try {
            logTwitterOperation("Uploading media file", { mediaUrl });

            // Download and upload media
            const response = await fetch(mediaUrl);
            if (!response.ok) {
              logTwitterOperation("Media fetch failed", {
                mediaUrl,
                status: response.status,
                statusText: response.statusText,
              });
              throw new Error(`Failed to fetch media: ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            const contentType =
              response.headers.get("content-type") || "image/jpeg";

            // Validate file size (Twitter limit: 5MB for images, 512MB for videos)
            const maxSize = contentType.startsWith("video/")
              ? 512 * 1024 * 1024
              : 5 * 1024 * 1024;
            if (buffer.byteLength > maxSize) {
              logTwitterOperation("Media file too large", {
                size: buffer.byteLength,
                maxSize,
                contentType,
              });
              console.warn(`Media file too large: ${buffer.byteLength} bytes`);
              continue;
            }

            const mediaId = await this.client.v1.uploadMedia(
              Buffer.from(buffer),
              {
                mimeType: contentType,
              }
            );
            mediaIds.push(mediaId);
            logTwitterOperation("Media uploaded successfully", {
              mediaId,
              contentType,
            });
          } catch (error: any) {
            logTwitterOperation("Media upload failed", {
              mediaUrl,
              error: error.message,
            });
            console.warn("Failed to upload media to Twitter:", error);
          }
        }
      }

      logTwitterOperation("Creating tweet", {
        contentLength: content.length,
        mediaIds: mediaIds.length,
      });

      // Create tweet
      const tweet = await this.client.v2.tweet({
        text: content,
        ...(mediaIds.length > 0 && {
          media: {
            media_ids: mediaIds.slice(0, 4) as
              | [string]
              | [string, string]
              | [string, string, string]
              | [string, string, string, string],
          },
        }),
      });

      logTwitterOperation("Tweet created successfully", {
        tweetId: tweet.data.id,
        text: tweet.data.text,
      });
      return {
        success: true,
        platformPostId: tweet.data.id,
        url: `https://twitter.com/user/status/${tweet.data.id}`,
        metadata: {
          mediaCount: mediaIds.length,
          contentLength: content.length,
          tweetType: "single",
        },
      };
    } catch (error: any) {
      logTwitterOperation("Twitter publish error", {
        error: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack,
      });

      // Handle specific Twitter API errors
      if (error.code === 187) {
        logTwitterOperation("Duplicate tweet error");
        return {
          success: false,
          error: "Duplicate tweet - this content has already been posted",
        };
      }

      if (error.code === 429) {
        logTwitterOperation("Rate limit exceeded");
        return {
          success: false,
          error: "Rate limit exceeded - please try again later",
        };
      }

      if (error.code === 32) {
        logTwitterOperation("Authentication error");
        return {
          success: false,
          error:
            "Twitter authentication failed - please reconnect your account",
        };
      }

      if (error.code === 89) {
        logTwitterOperation("Invalid or expired token");
        return {
          success: false,
          error:
            "Twitter token invalid or expired - please reconnect your account",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to publish to Twitter",
      };
    }
  }

  async getProfile() {
    try {
      logTwitterOperation("Fetching Twitter profile");

      const user = await this.client.v2.me({
        "user.fields": ["profile_image_url", "public_metrics"],
      });

      logTwitterOperation("Profile fetch successful", {
        userId: user.data.id,
        username: user.data.username,
      });

      return {
        id: user.data.id,
        username: user.data.username,
        displayName: user.data.name,
        avatarUrl: user.data.profile_image_url,
        followersCount: user.data.public_metrics?.followers_count || 0,
        followingCount: user.data.public_metrics?.following_count || 0,
        tweetCount: user.data.public_metrics?.tweet_count || 0,
        verified: user.data.verified || false,
      };
    } catch (error: any) {
      logTwitterOperation("Twitter profile error", {
        error: error.message,
        code: error.code,
        data: error.data,
      });
      throw error;
    }
  }

  async getAnalytics(tweetId: string) {
    try {
      logTwitterOperation("Fetching tweet analytics", { tweetId });

      const tweet = await this.client.v2.singleTweet(tweetId, {
        "tweet.fields": ["public_metrics", "created_at"],
      });

      logTwitterOperation("Analytics fetch successful", {
        tweetId,
        metrics: tweet.data.public_metrics,
      });
      return {
        likes: tweet.data.public_metrics?.like_count || 0,
        retweets: tweet.data.public_metrics?.retweet_count || 0,
        replies: tweet.data.public_metrics?.reply_count || 0,
        impressions: tweet.data.public_metrics?.impression_count || 0,
      };
    } catch (error: any) {
      logTwitterOperation("Twitter analytics error", {
        tweetId,
        error: error.message,
        code: error.code,
      });
      return null;
    }
  }

  // New method for thread creation
  async publishThread(
    tweets: string[],
    mediaUrls?: string[][]
  ): Promise<PublishResult> {
    try {
      const tweetIds: string[] = [];

      for (let i = 0; i < tweets.length; i++) {
        const content = tweets[i];
        const media = mediaUrls?.[i] || [];

        let mediaIds: string[] = [];

        // Upload media for this tweet
        if (media.length > 0) {
          for (const mediaUrl of media) {
            try {
              const response = await fetch(mediaUrl);
              const buffer = await response.arrayBuffer();
              const mediaId = await this.client.v1.uploadMedia(
                Buffer.from(buffer),
                {
                  mimeType:
                    response.headers.get("content-type") || "image/jpeg",
                }
              );
              mediaIds.push(mediaId);
            } catch (error) {
              console.warn("Failed to upload thread media:", error);
            }
          }
        }

        // Create tweet (reply to previous if not first)
        const tweetData: any = {
          text: content,
          media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined,
        };

        if (i > 0 && tweetIds.length > 0) {
          tweetData.reply = {
            in_reply_to_tweet_id: tweetIds[tweetIds.length - 1],
          };
        }

        const tweet = await this.client.v2.tweet(tweetData);
        tweetIds.push(tweet.data.id);
      }

      return {
        success: true,
        platformPostId: tweetIds[0], // Return first tweet ID
        url: `https://twitter.com/user/status/${tweetIds[0]}`,
        metadata: { threadIds: tweetIds },
      };
    } catch (error: any) {
      console.error("Twitter thread publish error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to publish thread to Twitter",
      };
    }
  }
}
