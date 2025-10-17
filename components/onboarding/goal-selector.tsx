'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const GOALS = [
  { id: 'brand-awareness', label: 'Brand Awareness', description: 'Increase visibility and recognition' },
  { id: 'lead-generation', label: 'Lead Generation', description: 'Generate qualified leads' },
  { id: 'customer-engagement', label: 'Customer Engagement', description: 'Build relationships with customers' },
  { id: 'sales', label: 'Sales', description: 'Drive direct sales and conversions' },
  { id: 'community-building', label: 'Community Building', description: 'Create a loyal community' },
  { id: 'thought-leadership', label: 'Thought Leadership', description: 'Establish industry expertise' }
] as const

interface GoalSelectorProps {
  selectedGoals: string[]
  onGoalsChange: (goals: string[]) => void
  minRequired?: number
}

export function GoalSelector({ 
  selectedGoals, 
  onGoalsChange, 
  minRequired = 1 
}: GoalSelectorProps) {
  const handleGoalToggle = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(g => g !== goalId)
      : [...selectedGoals, goalId]
    
    onGoalsChange(newGoals)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GOALS.map((goal) => (
          <div
            key={goal.id}
            className={cn(
              "flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50",
              selectedGoals.includes(goal.id) && "border-primary bg-primary/5"
            )}
            onClick={() => handleGoalToggle(goal.id)}
          >
            <Checkbox
              id={goal.id}
              checked={selectedGoals.includes(goal.id)}
              onCheckedChange={() => handleGoalToggle(goal.id)}
            />
            <div className="flex-1">
              <label
                htmlFor={goal.id}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {goal.label}
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                {goal.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {selectedGoals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGoals.map((goalId) => {
            const goal = GOALS.find(g => g.id === goalId)
            return goal ? (
              <Badge key={goalId} variant="secondary">
                {goal.label}
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}