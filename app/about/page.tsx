"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Users,
  Target,
  Award,
  Heart,
  Globe,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";

const teamMembers = [
  {
    name: "Alex Chen",
    role: "CEO & Co-Founder",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "Former VP of Engineering at Meta, passionate about democratizing AI for creators.",
  },
  {
    name: "Sarah Johnson",
    role: "CTO & Co-Founder",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
    bio: "AI researcher with 10+ years experience building scalable social media platforms.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Head of Product",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "Product leader focused on creating intuitive experiences for content creators.",
  },
  {
    name: "Emily Zhang",
    role: "Head of AI",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    bio: "PhD in Machine Learning, specializing in natural language processing and content generation.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Creator-First",
    description:
      "We put creators and their success at the center of everything we build.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We push the boundaries of what's possible with AI and social media technology.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "We prioritize user safety, data privacy, and responsible AI development.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description:
      "We make powerful tools accessible to creators of all sizes and backgrounds.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-6xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About SocialAI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to democratize social media success through the
            power of artificial intelligence.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-16">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              To empower every creator, entrepreneur, and business to build
              authentic connections and grow their audience through AI-powered
              social media management that feels personal, not robotic.
            </p>
          </CardContent>
        </Card>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                SocialAI was born from a simple observation: creating engaging
                social media content consistently is one of the biggest
                challenges facing creators and businesses today.
              </p>
              <p>
                Our founders, Alex and Sarah, experienced this firsthand while
                building their previous companies. They spent countless hours
                crafting posts, analyzing performance, and trying to maintain a
                consistent brand voice across multiple platforms.
              </p>
              <p>
                In 2023, they decided to solve this problem by combining their
                expertise in AI and social media to create a platform that could
                generate authentic, engaging content while preserving each
                brand's unique voice and personality.
              </p>
              <p>
                Today, SocialAI helps over 10,000 creators and businesses save
                time, increase engagement, and grow their audiences through
                intelligent automation and AI-powered insights.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
              alt="SocialAI team working together"
              className="w-full rounded-2xl shadow-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">10,000+</div>
                <div className="text-sm text-blue-600">Active Users</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1M+</div>
                <div className="text-sm text-purple-600">Posts Generated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to join our mission?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start creating amazing content with AI today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bbg-white text-blue-600 hover:bg-gray-100"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
