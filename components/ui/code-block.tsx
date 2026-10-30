"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"

function CopyButton({ value, className, ...props }: Omit<React.ComponentProps<typeof Button>, "onClick"> & { value: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? "Copied" : "Copy"}
      className={cn("text-muted-foreground", className)}
      // Clipboard access can be denied (insecure origin, permissions); then the icon simply doesn't change.
      onClick={() => navigator.clipboard?.writeText(value).then(() => setCopied(true), () => {})}
      {...props}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

// Monospace block with an optional filename header, line numbers and a copy button. No syntax highlighting,
// so it adds no highlighter dependency; pass pre-highlighted children instead of `code` if you need colors.
function CodeBlock({
  code,
  filename,
  language,
  showLineNumbers = false,
  className,
}: {
  code: string
  filename?: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}) {
  const lines = code.replace(/\n$/, "").split("\n")

  return (
    <figure data-slot="code-block" className={cn("overflow-hidden rounded-lg border bg-muted/40 text-sm", className)}>
      <figcaption className="flex items-center gap-2 border-b bg-muted/60 py-1 pr-1 pl-3 text-xs text-muted-foreground">
        <span className="truncate font-mono">{filename ?? language ?? "Code"}</span>
        <CopyButton value={code} className="ml-auto" />
      </figcaption>
      <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-relaxed">
        <code data-language={language}>
          {lines.map((line, i) => (
            <span key={i} className="flex px-3">
              {showLineNumbers && (
                <span aria-hidden className="mr-4 inline-block w-6 shrink-0 text-right text-muted-foreground/60 select-none">
                  {i + 1}
                </span>
              )}
              <span className="whitespace-pre">{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}

export { CodeBlock, CopyButton }
