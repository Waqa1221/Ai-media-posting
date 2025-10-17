"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Target,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  Clock,
  Hash,
  Image,
} from "lucide-react";
import { socialMediaBestPractices } from "@/lib/social/best-practices";

// Add these helper functions
const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
};

interface ContentOptimizationWidgetProps {
  content: string;
  hashtags: string[];
  platforms: string[];
  mediaUrls: string[];
  onOptimize?: (optimizations: any) => void;
}

export function ContentOptimizationWidget({
  content,
  hashtags,
  platforms,
  mediaUrls,
  onOptimize,
}: ContentOptimizationWidgetProps) {
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (content && platforms.length > 0) {
      analyzeContent();
    }
  }, [content, hashtags, platforms, mediaUrls]);

  const analyzeContent = () => {
    const results = platforms.map((platform) => {
      const validation = socialMediaBestPractices.validateContent(
        platform,
        content,
        hashtags,
        mediaUrls.length
      );
      const scoreData = socialMediaBestPractices.getContentScore(
        platform,
        content,
        hashtags,
        mediaUrls.length
      );
      const optimalTime =
        socialMediaBestPractices.getOptimalPostingTime(platform);

      return {
        platform,
        validation,
        score: scoreData.score,
        breakdown: scoreData.breakdown,
        recommendations: scoreData.recommendations,
        optimalTime,
      };
    });

    setOptimizationResults(results);
  };

  const getOverallScore = () => {
    if (!optimizationResults) return 0;
    const totalScore = optimizationResults.reduce(
      (sum: number, result: any) => sum + result.score,
      0
    );
    return Math.round(totalScore / optimizationResults.length);
  };

  const getAllRecommendations = () => {
    if (!optimizationResults) return [];
    const allRecommendations = optimizationResults.flatMap((result: any) =>
      result.recommendations.map((rec: string) => ({
        platform: result.platform,
        recommendation: rec,
      }))
    );

    // Remove duplicates
    const uniqueRecommendations = allRecommendations.filter(
      (
        rec: { platform: string; recommendation: string },
        index: number,
        self: { platform: string; recommendation: string }[]
      ) =>
        index === self.findIndex((r) => r.recommendation === rec.recommendation)
    );

    return uniqueRecommendations.slice(0, 5); // Show top 5
  };

  const optimizeContent = async () => {
    setIsOptimizing(true);
    try {
      // This would call your AI optimization API
      const response = await fetch("/api/ai/optimize-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          hashtags,
          platforms,
          mediaCount: mediaUrls.length,
        }),
      });

      const optimizations = await response.json();

      if (onOptimize) {
        onOptimize(optimizations);
      }
    } catch (error) {
      console.error("Error optimizing content:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const overallScore = getOverallScore();
  const recommendations = getAllRecommendations();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Content Optimization
            </CardTitle>
            <CardDescription>
              AI-powered content analysis and recommendations
            </CardDescription>
          </div>
          {content && (
            <Button onClick={optimizeContent} disabled={isOptimizing} size="sm">
              {isOptimizing ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Optimize
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!content ? (
          <div className="text-center py-6">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Add content to see optimization suggestions
            </p>
          </div>
        ) : (
          <>
            {/* Overall Score */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div
                className={`text-4xl font-bold ${getScoreColor(
                  overallScore
                )} mb-2`}
              >
                {overallScore}/100
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Overall Content Score
              </div>
              <Progress value={overallScore} className="h-2" />
            </div>

            {/* Platform Scores */}
            {optimizationResults && (
              <div className="space-y-3">
                <h4 className="font-medium">Platform Scores</h4>
                {optimizationResults.map((result: any) => (
                  <div
                    key={result.platform}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {result.platform === "instagram" && "📸"}
                        {result.platform === "linkedin" && "💼"}
                        {result.platform === "twitter" && "🐦"}
                        {result.platform === "facebook" && "📘"}
                        {result.platform === "tiktok" && "🎵"}
                      </span>
                      <div>
                        <div className="font-medium text-sm capitalize">
                          {result.platform}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.validation.errors.length > 0
                            ? "Has errors"
                            : result.validation.warnings.length > 0
                            ? "Has warnings"
                            : "Looks good"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${getScoreColor(
                          result.score
                        )}`}
                      >
                        {result.score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getScoreLabel(result.score)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  {recommendations.map(
                    (rec: { platform: string; recommendation: string }, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm">{rec.recommendation}</div>
                          <div className="text-xs text-blue-600 mt-1 capitalize">
                            For {rec.platform}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">{content.length}</div>
                <div className="text-xs text-muted-foreground">Characters</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">{hashtags.length}</div>
                <div className="text-xs text-muted-foreground">Hashtags</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">{platforms.length}</div>
                <div className="text-xs text-muted-foreground">Platforms</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">{mediaUrls.length}</div>
                <div className="text-xs text-muted-foreground">Media Files</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
