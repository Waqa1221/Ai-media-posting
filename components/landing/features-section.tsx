'use client'

import { 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Zap, 
  Shield, 
  Users,
  MessageSquare,
  Image,
  Clock
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI Content Generation',
    description: 'Generate engaging posts, captions, and hashtags tailored to your brand voice and audience.',
    color: 'text-blue-600 bg-gradient-to-br from-blue-100 to-blue-50',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Schedule posts across multiple platforms with optimal timing recommendations.',
    color: 'text-purple-600 bg-gradient-to-br from-purple-100 to-purple-50',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track performance, engagement, and growth with detailed insights and reports.',
    color: 'text-green-600 bg-gradient-to-br from-green-100 to-green-50',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: MessageSquare,
    title: 'Auto Engagement',
    description: 'AI-powered comment responses and engagement automation to grow your community.',
    color: 'text-orange-600 bg-gradient-to-br from-orange-100 to-orange-50',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Image,
    title: 'Visual Content',
    description: 'Generate stunning images and graphics with AI-powered design tools.',
    color: 'text-pink-600 bg-gradient-to-br from-pink-100 to-pink-50',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Shield,
    title: 'Brand Safety',
    description: 'Content moderation and brand safety features to protect your reputation.',
    color: 'text-red-600 bg-gradient-to-br from-red-100 to-red-50',
    gradient: 'from-red-500 to-pink-500'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to dominate social media
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides all the tools you need to create, schedule, 
            and analyze your social media content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative p-8 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-2xl group hover:scale-105 overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-12 shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Save 10+ Hours Weekly</h4>
              <p className="text-gray-600">Automate your content creation and scheduling workflow</p>
            </div>
            <div>
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Multi-Platform Support</h4>
              <p className="text-gray-600">Manage Instagram, LinkedIn, TikTok, and more from one dashboard</p>
            </div>
            <div>
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Optimization</h4>
              <p className="text-gray-600">AI continuously learns and improves your content performance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}