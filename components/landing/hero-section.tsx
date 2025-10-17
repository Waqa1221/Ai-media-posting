"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Zap,
  Users,
  Share2,
  Target,
  CheckCircle,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Social Media Management
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create Viral Content with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              AI Magic
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Generate engaging posts, schedule across platforms, and grow your
            audience 10x faster with our AI-powered social media management
            platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              asChild
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* How It Works Stepper */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                {
                  step: 1,
                  title: "Connect Accounts",
                  description: "Link your social media platforms in seconds",
                  icon: "🔗",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  step: 2,
                  title: "Generate Content",
                  description: "AI create and tailored your brand posts",
                  icon: "✨",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  step: 3,
                  title: "Schedule & Publish",
                  description: "Automatically post at optimal times",
                  icon: "📅",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  step: 4,
                  title: "Track Performance",
                  description: "Monitor growth with detailed analytics",
                  icon: "📊",
                  color: "from-orange-500 to-red-500",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  {/* Connector Lines - Only show on md screens and above */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0"></div>
                  )}

                  {/* Mobile connector lines for 2x2 grid */}
                  {index < 2 && (
                    <div className="md:hidden absolute top-full left-1/2 w-0.5 h-4 bg-gradient-to-b from-gray-300 to-gray-200 z-0 transform -translate-x-1/2"></div>
                  )}

                  {/* Step Card */}
                  <div className="relative z-10 bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-xl md:text-2xl mb-3 md:mb-4 mx-auto shadow-lg`}
                    >
                      {item.icon}
                    </div>
                    <div className="text-center">
                      <div className="text-xs md:text-sm font-semibold text-gray-500 mb-1">
                        STEP {item.step}
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 shadow-lg">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1 md:mb-2">
                100K+
              </div>
              <div className="text-gray-700 font-medium text-sm md:text-base">
                Active Users
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 shadow-lg">
                <Share2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 md:mb-2">
                1M+
              </div>
              <div className="text-gray-700 font-medium text-sm md:text-base">
                Shares
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 shadow-lg">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 md:mb-2">
                50K+
              </div>
              <div className="text-gray-700 font-medium text-sm md:text-base">
                Posts Generated
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 shadow-lg">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1 md:mb-2">
                99%
              </div>
              <div className="text-gray-700 font-medium text-sm md:text-base">
                Uptime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
    </section>
  );
}
