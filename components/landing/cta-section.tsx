"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8 shadow-lg hover:bg-white/30 transition-all duration-300">
          <Sparkles className="w-4 h-4 mr-2" />
          Join 10,000+ creators already using SocialAI
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
          Ready to transform your social media?
        </h2>

        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
          Start your free trial today and experience the power of AI-driven
          social media management.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl"
          >
            <Link href="/auth/signup">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 bg-white text-blue-600 hover:bg-gray-100  text-lg px-10 py-5 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl"
            asChild
          >
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>

        <p className="text-blue-100 text-sm mt-8 opacity-90">
          No credit card required • 7-day free trial • Cancel anytime
        </p>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
