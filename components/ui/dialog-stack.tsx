"use client"

import * as React from "react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const DialogStackContext = React.createContext<{ index: number; count: number; setIndex: (i: number) => void } | null>(null)

function useDialogStack() {
  const ctx = React.useContext(DialogStackContext)
  if (!ctx) throw new Error("useDialogStack must be used inside <DialogStack>")
  return ctx
}

// A Dialog that walks through its child panels one at a time; finished panels peek out behind the active one.
function DialogStack({
  trigger,
  children,
  onOpenChange,
  className,
  ...props
}: React.ComponentProps<typeof Dialog> & { trigger?: React.ReactNode; className?: string }) {
  const panels = React.Children.toArray(children)
  const [index, setIndex] = React.useState(0)

  return (
    <DialogStackContext.Provider value={{ index, count: panels.length, setIndex }}>
      <Dialog
        onOpenChange={(open) => {
          if (!open) setIndex(0)
          onOpenChange?.(open)
        }}
        {...props}
      >
        {trigger}
        <DialogContent data-slot="dialog-stack" className={cn("overflow-visible", className)}>
          {Array.from({ length: Math.min(index, 2) }, (_, i) => (
            <div
              key={i}
              aria-hidden
              className="absolute inset-x-0 -z-10 h-full rounded-[inherit] border bg-muted"
              style={{ top: `${-(i + 1) * 12}px`, scale: `${1 - (i + 1) * 0.05}`, opacity: 1 - (i + 1) * 0.3 }}
            />
          ))}
          {panels[index]}
        </DialogContent>
      </Dialog>
    </DialogStackContext.Provider>
  )
}

function DialogStackFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { index, count } = useDialogStack()
  return (
    <div data-slot="dialog-stack-footer" className={cn("flex items-center justify-between gap-2", className)}>
      <span className="text-xs text-muted-foreground tabular-nums">
        Step {index + 1} of {count}
      </span>
      <div className="flex gap-2" {...props} />
    </div>
  )
}

function DialogStackPrevious(props: React.ComponentProps<typeof Button>) {
  const { index, setIndex } = useDialogStack()
  return <Button variant="outline" disabled={index === 0} onClick={() => setIndex(index - 1)} {...props} />
}

function DialogStackNext(props: React.ComponentProps<typeof Button>) {
  const { index, count, setIndex } = useDialogStack()
  return <Button disabled={index === count - 1} onClick={() => setIndex(index + 1)} {...props} />
}

export { DialogStack, DialogStackFooter, DialogStackNext, DialogStackPrevious, useDialogStack }
