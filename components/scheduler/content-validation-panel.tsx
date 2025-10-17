"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Target,
  Hash,
  Image,
  Clock,
  Lightbulb,
} from "lucide-react";
import { socialMediaBestPractices } from "@/lib/social/best-practices";

interface ContentValidationPanelProps {
  content: string;
  hashtags: string[];
  platforms: string[];
  mediaUrls: string[];
  scheduledTime?: string;
}

export function ContentValidationPanel({
  content,
  hashtags,
  platforms,
  mediaUrls,
  scheduledTime,
}: ContentValidationPanelProps) {
  const validationResults = useMemo(() => {
    return platforms.map((platform) => {
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

      const engagementPrediction =
        socialMediaBestPractices.getEngagementPrediction(
          platform,
          content,
          hashtags,
          scheduledTime || "09:00"
        );

      return {
        platform,
        validation,
        score: scoreData.score,
        breakdown: scoreData.breakdown,
        recommendations: scoreData.recommendations,
        engagementPrediction,
      };
    });
  }, [content, hashtags, platforms, mediaUrls, scheduledTime]);

  const overallScore = useMemo(() => {
    if (validationResults.length === 0) return 0;
    const totalScore = validationResults.reduce(
      (sum, result) => sum + result.score,
      0
    );
    return Math.round(totalScore / validationResults.length);
  }, [validationResults]);

  const allErrors = useMemo(() => {
    return validationResults.flatMap((result) =>
      result.validation.errors.map((error) => ({
        platform: result.platform,
        error,
      }))
    );
  }, [validationResults]);

  const allWarnings = useMemo(() => {
    return validationResults.flatMap((result) =>
      result.validation.warnings.map((warning) => ({
        platform: result.platform,
        warning,
      }))
    );
  }, [validationResults]);

  const topRecommendations = useMemo(() => {
    const allRecs = validationResults.flatMap((result) =>
      result.recommendations.map((rec) => ({
        platform: result.platform,
        recommendation: rec,
      }))
    );

    // Remove duplicates and return top 5
    const uniqueRecs = allRecs.filter(
      (rec, index, self) =>
        index === self.findIndex((r) => r.recommendation === rec.recommendation)
    );

    return uniqueRecs.slice(0, 5);
  }, [validationResults]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      instagram: "📸",
      linkedin: "💼",
      twitter: "🐦",
      facebook: "📘",
      tiktok: "🎵",
    };
    return icons[platform] || "📱";
  };

  const canPublish = allErrors.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Content Validation
        </CardTitle>
        <CardDescription>
          AI-powered content analysis and optimization recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div
            className={`text-4xl font-bold ${getScoreColor(overallScore)} mb-2`}
          >
            {overallScore}/100
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Overall Content Quality Score
          </div>
          <Progress value={overallScore} className="h-2" />
          <div className="text-xs text-muted-foreground mt-2">
            {getScoreLabel(overallScore)}
          </div>
        </div>

        {/* Validation Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {canPublish ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <div className="font-medium">
                {canPublish ? "Ready to Publish" : "Issues Found"}
              </div>
              <div className="text-sm text-muted-foreground">
                {canPublish
                  ? "Your content meets all platform requirements"
                  : `${allErrors.length} error${
                      allErrors.length !== 1 ? "s" : ""
                    } need to be fixed`}
              </div>
            </div>
          </div>
          <Badge
            className={
              canPublish
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          >
            {canPublish ? "Valid" : "Invalid"}
          </Badge>
        </div>

        {/* Platform Scores */}
        {validationResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Platform Analysis</h4>
            {validationResults.map((result) => (
              <div key={result.platform} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getPlatformIcon(result.platform)}
                    </span>
                    <span className="font-medium capitalize">
                      {result.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-lg font-bold ${getScoreColor(
                        result.score
                      )}`}
                    >
                      {result.score}
                    </div>
                    <Badge
                      className={
                        result.validation.errors.length > 0
                          ? "bg-red-100 text-red-800"
                          : result.validation.warnings.length > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {result.validation.errors.length > 0
                        ? "Errors"
                        : result.validation.warnings.length > 0
                        ? "Warnings"
                        : "Good"}
                    </Badge>
                  </div>
                </div>

                {/* Engagement Prediction */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {result.engagementPrediction.predictedEngagement}%
                    </div>
                    <div className="text-xs text-blue-600">
                      Predicted Engagement
                    </div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {result.engagementPrediction.confidence}%
                    </div>
                    <div className="text-xs text-green-600">Confidence</div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2">
                  {Object.entries(result.breakdown).map(([category, score]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="capitalize">
                        {category.replace(/([A-Z])/g, " $1")}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${(score / 25) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium w-8">{score}/25</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Errors */}
        {allErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Errors that must be fixed:</div>
                {allErrors.map((error, index) => (
                  <div key={index} className="text-sm">
                    • <span className="capitalize">{error.platform}</span>:{" "}
                    {error.error}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings */}
        {allWarnings.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-1">
                <div className="font-medium">Warnings to consider:</div>
                {allWarnings.map((warning, index) => (
                  <div key={index} className="text-sm">
                    • <span className="capitalize">{warning.platform}</span>:{" "}
                    {warning.warning}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations */}
        {topRecommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Optimization Recommendations
            </h4>
            <div className="space-y-2">
              {topRecommendations.map((rec, index) => (
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
              ))}
            </div>
          </div>
        )}

        {/* Content Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-bold">{content.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Characters</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-bold">{hashtags.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Hashtags</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Image className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-bold">{mediaUrls.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Media Files</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-bold">{platforms.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Platforms</div>
          </div>
        </div>

        {/* Best Practices Reminder */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1 text-sm">
              <div className="font-medium">
                Quick Tips for Better Performance:
              </div>
              <div>• Include questions to encourage comments</div>
              <div>• Use relevant hashtags for discoverability</div>
              <div>• Add high-quality visuals when possible</div>
              <div>• Post at optimal times for your audience</div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
