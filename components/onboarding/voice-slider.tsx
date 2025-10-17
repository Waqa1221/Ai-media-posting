'use client'

import { Slider } from '@/components/ui/slider'

interface VoiceSliderProps {
  label: string
  value: number
  onValueChange: (value: number) => void
  leftLabel: string
  rightLabel: string
  getValueLabel: (value: number) => string
}

export function VoiceSlider({
  label,
  value,
  onValueChange,
  leftLabel,
  rightLabel,
  getValueLabel
}: VoiceSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {getValueLabel(value)}
        </span>
      </div>
      <div className="px-3">
        <Slider
          value={[value]}
          onValueChange={(values) => onValueChange(values[0])}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  )
}