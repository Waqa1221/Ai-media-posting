'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Settings, 
  CreditCard,
  Users,
  MessageSquare,
  Image,
  Menu,
  Zap,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Generator', href: '/dashboard/ai-generator', icon: Sparkles },
  { name: 'AI Agency', href: '/dashboard/agency', icon: Zap },
  { name: 'Posts', href: '/dashboard/posts', icon: MessageSquare },
  { name: 'Scheduler', href: '/dashboard/scheduler', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Media Library', href: '/dashboard/media', icon: Image },
  { name: 'Social Accounts', href: '/dashboard/social-accounts', icon: Users },
  { name: 'Automations', href: '/dashboard/automations', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-md shadow-md"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SocialAI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-blue-700" : "text-gray-400"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Upgrade to Pro
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Unlock unlimited AI generations and advanced features.
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}