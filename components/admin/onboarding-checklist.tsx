'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle } from 'lucide-react'

interface Step {
  id: string
  label: string
  path: string
}

interface OnboardingChecklistProps {
  steps: Step[]
  completedStepIds: string[]
  organizationId: string
}

export function OnboardingChecklist({ steps, completedStepIds, organizationId }: OnboardingChecklistProps) {
  const completedCount = completedStepIds.length
  const totalCount = steps.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <Card data-testid="onboarding-checklist" className="border-pink-100 bg-pink-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Postavljanje salona</CardTitle>
          <Badge variant="secondary">{completedCount}/{totalCount}</Badge>
        </div>
        <div className="w-full bg-pink-100 rounded-full h-1.5 mt-2">
          <div
            className="h-1.5 rounded-full bg-pink-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {steps.map((step, idx) => {
            const done = completedStepIds.includes(step.id)
            return (
              <li
                key={step.id}
                data-testid="checklist-step"
                className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 transition-colors ${
                  done ? 'text-muted-foreground' : 'hover:bg-pink-100/60'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-pink-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-pink-300 flex-shrink-0" />
                )}
                {done ? (
                  <span className="line-through">{step.label}</span>
                ) : (
                  <Link href={step.path} className="hover:text-pink-600 transition-colors">
                    {idx + 1}. {step.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
