'use client'

import { useMemo } from 'react'

interface PasswordStrengthProps {
  password: string
  className?: string
}

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0

  // Length check
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // Character variety
  if (/(?=.*[a-z])/.test(password)) score += 1
  if (/(?=.*[A-Z])/.test(password)) score += 1
  if (/(?=.*\d)/.test(password)) score += 1
  if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score += 1

  // Common patterns (negative points)
  if (/(.)\1{2,}/.test(password)) score -= 1 // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 1 // Sequential patterns

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a', '#15803d']

  const index = Math.max(0, Math.min(score, labels.length - 1))

  return {
    score,
    label: labels[index],
    color: colors[index]
  }
}

export function PasswordStrength({ password, className = '' }: PasswordStrengthProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password])

  if (!password) return null

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span 
          className="text-xs font-medium"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(10, (strength.score / 5) * 100)}%`,
            backgroundColor: strength.color
          }}
        />
      </div>
    </div>
  )
}