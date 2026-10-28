import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "cn"

type WizardStep = {
  title: string
  shortTitle: string
}

type WizardStepperProps = {
  steps: WizardStep[]
  currentStep: number
  completedSteps: number[]
  label: string
  onStepChange: (step: number) => void
}

export function WizardStepper({ steps, currentStep, completedSteps, label, onStepChange }: WizardStepperProps) {
  return (
    <nav aria-label={label}>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep
          const isComplete = completedSteps.includes(index)
          const isAvailable = index <= currentStep || isComplete

          return (
            <li key={step.title}>
              <Button
                type="button"
                variant="ghost"
                disabled={!isAvailable}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${step.title}${isComplete ? ", completed" : isCurrent ? ", current step" : ", upcoming"}`}
                onClick={() => onStepChange(index)}
                className={cn(
                  "h-auto w-full justify-start gap-2 rounded-lg border px-2.5 py-2 text-left sm:px-3",
                  isCurrent ? "border-primary bg-secondary text-secondary-foreground hover:bg-secondary" : isComplete ? "border-primary/40 bg-muted/30 text-foreground hover:bg-muted" : "border-border bg-card text-muted-foreground",
                )}
              >
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${isComplete ? "bg-primary text-primary-foreground" : isCurrent ? "bg-background text-foreground" : "bg-muted text-muted-foreground"}`}>
                  {isComplete ? <CheckIcon aria-hidden="true" className="size-3.5" /> : index + 1}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-xs font-medium sm:text-sm">{step.shortTitle}</span>
                  <span className="hidden truncate text-[11px] text-muted-foreground sm:block">{isComplete ? "Completed" : isCurrent ? "In progress" : "Upcoming"}</span>
                </span>
              </Button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
