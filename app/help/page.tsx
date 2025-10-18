"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Book,
  MessageSquare,
  CreditCard,
  Settings,
  Zap,
  Users,
  ChevronRight,
  ExternalLink,
  Star,
  Clock,
} from "lucide-react";
import Link from "next/link";

const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Book,
    color: "bg-blue-100 text-blue-800",
    questions: [
      {
        question: "How do I create my first AI-generated post?",
        answer:
          'Navigate to the AI Generator in your dashboard, fill out the content brief with your industry and keywords, then click "Generate Content". The AI will create engaging posts tailored to your brand.',
      },
      {
        question: "How do I connect my social media accounts?",
        answer:
          'Go to Settings > Social Accounts and click "Connect" next to each platform you want to use. You\'ll be redirected to authorize SocialAI to post on your behalf.',
      },
      {
        question: "What platforms does SocialAI support?",
        answer:
          "We currently support Instagram, LinkedIn, Twitter/X, Facebook, and TikTok. More platforms are being added regularly.",
      },
    ],
  },
  {
    id: "ai-content",
    title: "AI Content Generation",
    icon: Zap,
    color: "bg-purple-100 text-purple-800",
    questions: [
      {
        question: "How does the AI understand my brand voice?",
        answer:
          "Our AI analyzes your content brief, brand voice description, and previous posts to learn your unique style and tone. The more you use it, the better it gets at matching your voice.",
      },
      {
        question: "Can I edit AI-generated content?",
        answer:
          "Absolutely! All AI-generated content can be edited before publishing. We recommend reviewing and customizing the content to ensure it perfectly matches your brand.",
      },
      {
        question: "What if I don't like the generated content?",
        answer:
          "You can regenerate content as many times as needed. Try adjusting your content brief or being more specific about your requirements for better results.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Subscription",
    icon: CreditCard,
    color: "bg-green-100 text-green-800",
    questions: [
      {
        question: "How does the 7-day free trial work?",
        answer:
          "Your free trial gives you full access to all features for 7 days. No credit card required to start. After the trial, you'll be charged $70/month unless you cancel.",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Yes, you can cancel your subscription at any time from your billing settings. If you cancel, you'll retain access until the end of your current billing period.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express, Discover) through our secure payment processor, Stripe.",
      },
    ],
  },
  {
    id: "features",
    title: "Features & Usage",
    icon: Settings,
    color: "bg-orange-100 text-orange-800",
    questions: [
      {
        question: "How does the scheduling feature work?",
        answer:
          "You can schedule posts for optimal times across all connected platforms. Our AI suggests the best posting times based on your audience engagement patterns.",
      },
      {
        question: "Can I collaborate with team members?",
        answer:
          "Yes! You can invite team members with different permission levels (admin, editor, contributor, viewer) to collaborate on content creation and management.",
      },
      {
        question: "How accurate are the analytics?",
        answer:
          "Our analytics pull data directly from each platform's official APIs, ensuring accuracy. Data is updated in real-time and includes engagement, reach, impressions, and more.",
      },
    ],
  },
];

const popularArticles = [
  {
    title: "Complete Guide to AI Content Generation",
    description: "Learn how to create engaging content with AI",
    readTime: "8 min read",
    category: "AI Content",
    href: "/help/ai-content-guide",
  },
  {
    title: "Setting Up Your Social Media Accounts",
    description: "Step-by-step guide to connecting platforms",
    readTime: "5 min read",
    category: "Setup",
    href: "/help/social-setup",
  },
  {
    title: "Optimizing Your Posting Schedule",
    description: "Best practices for timing your content",
    readTime: "6 min read",
    category: "Strategy",
    href: "/help/posting-schedule",
  },
  {
    title: "Understanding Your Analytics",
    description: "Make sense of your performance data",
    readTime: "7 min read",
    category: "Analytics",
    href: "/help/analytics-guide",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = faqCategories.filter((category) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      category.title.toLowerCase().includes(searchLower) ||
      category.questions.some(
        (q) =>
          q.question.toLowerCase().includes(searchLower) ||
          q.answer.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-6xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions and learn how to get the most out
            of SocialAI.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                {faqCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.title}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Popular Articles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularArticles.map((article, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-medium text-sm mb-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* FAQ Categories */}
            <div className="space-y-8">
              {filteredCategories
                .filter(
                  (category) =>
                    selectedCategory === null ||
                    category.id === selectedCategory
                )
                .map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <category.icon className="w-5 h-5" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.questions.map((qa, index) => (
                        <div
                          key={index}
                          className="border-b last:border-b-0 pb-4 last:pb-0"
                        >
                          <h3 className="font-medium text-gray-900 mb-2">
                            {qa.question}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {qa.answer}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Still Need Help */}
            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Still need help?
                </h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Our support team is here
                  to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/contact">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/docs">
                      <Book className="w-4 h-4 mr-2" />
                      View Documentation
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
