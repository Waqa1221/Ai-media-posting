"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Building2,
  Users,
  Target,
  Calendar,
  Image,
  Wand as Wand2,
  CircleCheck as CheckCircle,
  ArrowRight,
  Clock,
  Zap,
  CircleAlert,
  AlertCircle,
} from "lucide-react";
import { IndustrySelect } from "@/components/onboarding/industry-select";
import { PlatformCard } from "@/components/onboarding/platform-card";
import { SOCIAL_PLATFORMS } from "@/lib/constants/industries";
import { toast } from "sonner";

interface AgencySetupData {
  // Business Information
  businessName: string;
  industry: string;
  description: string;
  targetAudience: string;

  // Brand Voice & Content
  brandVoice: string;
  contentPillars: string[];
  contentThemes: string[];

  // Automation Settings
  postingFrequency: string;
  platforms: string[];
  optimalTimes: Record<string, string>;

  // Media Preferences
  useMediaLibrary: boolean;
  useAIImages: boolean;

  // Automation Level
  automationLevel: "full" | "assisted" | "manual";
}

const POSTING_FREQUENCIES = [
  {
    value: "daily",
    label: "Daily (7 posts/week)",
    description: "Maximum engagement and presence",
  },
  {
    value: "few-times-week",
    label: "3-4 times per week",
    description: "Balanced approach",
  },
  {
    value: "weekly",
    label: "Weekly (1 post/week)",
    description: "Minimal but consistent",
  },
];

const AUTOMATION_LEVELS = [
  {
    value: "full",
    label: "Full Autopilot",
    description:
      "AI handles everything - content creation, scheduling, and publishing",
    icon: Zap,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "assisted",
    label: "AI Assisted",
    description: "AI creates content, you approve before publishing",
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "manual",
    label: "Manual Control",
    description: "AI generates content suggestions, you control everything",
    icon: Target,
    color: "bg-gray-100 text-gray-800",
  },
];

const CONTENT_THEMES = [
  "Educational Tips",
  "Behind the Scenes",
  "Customer Stories",
  "Industry News",
  "Product Features",
  "Team Highlights",
  "Motivational Content",
  "How-to Guides",
  "Company Updates",
  "User Generated Content",
  "Trending Topics",
  "Case Studies",
];

function AgencySetupContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<AgencySetupData>({
    businessName: "",
    industry: "",
    description: "",
    targetAudience: "",
    brandVoice: "",
    contentPillars: [],
    contentThemes: [],
    postingFrequency: "few-times-week",
    platforms: [],
    optimalTimes: {},
    useMediaLibrary: false,
    useAIImages: true,
    automationLevel: "full",
  });

  const router = useRouter();
  const supabase = createClient();
  const totalSteps = 5;

  const updateSetupData = (updates: Partial<AgencySetupData>) => {
    setSetupData((prev) => ({ ...prev, ...updates }));
  };

  const addContentPillar = (pillar: string) => {
    if (pillar.trim() && !setupData.contentPillars.includes(pillar.trim())) {
      updateSetupData({
        contentPillars: [...setupData.contentPillars, pillar.trim()],
      });
    }
  };

  const removeContentPillar = (index: number) => {
    updateSetupData({
      contentPillars: setupData.contentPillars.filter((_, i) => i !== index),
    });
  };

  const toggleContentTheme = (theme: string) => {
    const newThemes = setupData.contentThemes.includes(theme)
      ? setupData.contentThemes.filter((t) => t !== theme)
      : [...setupData.contentThemes, theme];

    updateSetupData({ contentThemes: newThemes });
  };

  const togglePlatform = (platformId: string) => {
    const newPlatforms = setupData.platforms.includes(platformId)
      ? setupData.platforms.filter((p) => p !== platformId)
      : [...setupData.platforms, platformId];

    updateSetupData({ platforms: newPlatforms });
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return (
          setupData.businessName && setupData.industry && setupData.description
        );
      case 2:
        return (
          setupData.targetAudience &&
          setupData.brandVoice &&
          setupData.contentPillars.length >= 3
        );
      case 3:
        return (
          setupData.contentThemes.length >= 3 && setupData.postingFrequency
        );
      case 4:
        return setupData.platforms.length >= 1;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please complete all required fields");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create the client project
      const response = await fetch("/api/agency/setup-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...setupData,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to setup agency automation");
      }

      toast.success("🎉 Your AI Marketing Agency is now active!");
      router.push("/dashboard/agency");
    } catch (error) {
      console.error("Error setting up agency:", error);
      toast.error("Failed to setup agency automation");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Tell us about your business so our AI can represent your brand
                perfectly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Business Name *
                </label>
                <Input
                  placeholder="Acme Corporation"
                  value={setupData.businessName}
                  onChange={(e) =>
                    updateSetupData({ businessName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Industry *
                </label>
                <IndustrySelect
                  value={setupData.industry}
                  onValueChange={(value) =>
                    updateSetupData({ industry: value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Business Description *
                </label>
                <Textarea
                  placeholder="Describe what your business does, your unique value proposition, and what makes you different..."
                  value={setupData.description}
                  onChange={(e) =>
                    updateSetupData({ description: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Brand Voice & Content Strategy
              </CardTitle>
              <CardDescription>
                Define your brand voice and content pillars for consistent
                messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Target Audience *
                </label>
                <Textarea
                  placeholder="Describe your ideal customers - demographics, interests, pain points, and goals..."
                  value={setupData.targetAudience}
                  onChange={(e) =>
                    updateSetupData({ targetAudience: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Brand Voice & Personality *
                </label>
                <Textarea
                  placeholder="Describe how your brand communicates - professional, friendly, bold, humorous, authoritative, etc..."
                  value={setupData.brandVoice}
                  onChange={(e) =>
                    updateSetupData({ brandVoice: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content Pillars * (Add at least 3)
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Industry Expertise, Customer Success, Innovation"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addContentPillar(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={(e) => {
                        const input =
                          e.currentTarget.parentElement?.querySelector("input");
                        if (input) {
                          addContentPillar(input.value);
                          input.value = "";
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  {setupData.contentPillars.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {setupData.contentPillars.map((pillar, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {pillar}
                          <button
                            onClick={() => removeContentPillar(index)}
                            className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Content Themes & Frequency
              </CardTitle>
              <CardDescription>
                Choose content themes and posting frequency for your AI
                marketing agency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Content Themes * (Select at least 3)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CONTENT_THEMES.map((theme) => (
                    <div
                      key={theme}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        setupData.contentThemes.includes(theme)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleContentTheme(theme)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={setupData.contentThemes.includes(theme)}
                          onChange={() => toggleContentTheme(theme)}
                        />
                        <span className="text-sm font-medium">{theme}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Posting Frequency *
                </label>
                <div className="space-y-3">
                  {POSTING_FREQUENCIES.map((freq) => (
                    <div
                      key={freq.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        setupData.postingFrequency === freq.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        updateSetupData({ postingFrequency: freq.value })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{freq.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {freq.description}
                          </div>
                        </div>
                        {setupData.postingFrequency === freq.value && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Platform Selection & Media Preferences
              </CardTitle>
              <CardDescription>
                Choose your social media platforms and how you want to handle
                images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Social Media Platforms * (Select at least 1)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <PlatformCard
                      key={platform.id}
                      platform={platform}
                      isSelected={setupData.platforms.includes(platform.id)}
                      onToggle={() => togglePlatform(platform.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <label className="text-sm font-medium mb-3 block">
                  Image Handling Preferences
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      checked={setupData.useAIImages}
                      onCheckedChange={(checked) =>
                        updateSetupData({ useAIImages: !!checked })
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">
                          Generate images with AI
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI will create custom images for each post based on your
                        content
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      checked={setupData.useMediaLibrary}
                      onCheckedChange={(checked) =>
                        updateSetupData({ useMediaLibrary: !!checked })
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          Use images from Media Library
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI will select from your uploaded images in the Media
                        Library
                      </p>
                    </div>
                  </div>
                </div>

                {!setupData.useAIImages && !setupData.useMediaLibrary && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Select at least one image option for better content
                      engagement
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automation Level & Final Setup
              </CardTitle>
              <CardDescription>
                Choose how much control you want over the AI marketing agency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Automation Level
                </label>
                <div className="space-y-3">
                  {AUTOMATION_LEVELS.map((level) => (
                    <div
                      key={level.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        setupData.automationLevel === level.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        updateSetupData({
                          automationLevel: level.value as
                            | "full"
                            | "assisted"
                            | "manual",
                        })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <level.icon className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {level.description}
                            </div>
                          </div>
                        </div>
                        {setupData.automationLevel === level.value && (
                          <Badge className={level.color}>Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Setup Summary */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Setup Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business:</span>
                    <span className="font-medium">
                      {setupData.businessName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry:</span>
                    <span className="font-medium capitalize">
                      {setupData.industry.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Posting Frequency:
                    </span>
                    <span className="font-medium">
                      {
                        POSTING_FREQUENCIES.find(
                          (f) => f.value === setupData.postingFrequency
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platforms:</span>
                    <span className="font-medium">
                      {setupData.platforms.length} selected
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Content Themes:
                    </span>
                    <span className="font-medium">
                      {setupData.contentThemes.length} selected
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Automation:</span>
                    <span className="font-medium">
                      {
                        AUTOMATION_LEVELS.find(
                          (l) => l.value === setupData.automationLevel
                        )?.label
                      }
                    </span>
                  </div>
                </div>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Ready to launch!</strong> Your AI Marketing Agency
                  will start working immediately after setup. You can monitor
                  progress and make adjustments anytime from your agency
                  dashboard.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          AI Marketing Agency Setup
        </h1>
        <p className="text-muted-foreground text-center">
          Set up your AI-powered marketing agency that works 24/7 for your
          business
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Step {currentStep} of {totalSteps}
            </h2>
            <div className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </div>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceedToNextStep()}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up your AI Agency...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Launch AI Marketing Agency
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AgencySetupPage() {
  return <AgencySetupContent />;
}
