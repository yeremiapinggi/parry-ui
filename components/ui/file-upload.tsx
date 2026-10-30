"use client"

import * as React from "react"
import { FileIcon, XIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Dropzone, formatBytes, type DropzoneRejection } from "@/components/ui/dropzone"

// A Dropzone plus the list of chosen files; uploading them is left to the caller.
function FileUpload({
  value,
  onValueChange,
  accept,
  maxSize,
  maxFiles = 10,
  description,
  className,
}: {
  value: File[]
  onValueChange: (files: File[]) => void
  accept?: string
  maxSize?: number
  maxFiles?: number
  description?: React.ReactNode
  className?: string
}) {
  const [errors, setErrors] = React.useState<DropzoneRejection[]>([])
  const full = value.length >= maxFiles

  return (
    <div data-slot="file-upload" className={cn("flex w-full flex-col gap-3", className)}>
      <Dropzone
        multiple={maxFiles > 1}
        accept={accept}
        maxSize={maxSize}
        disabled={full}
        description={full ? `Limit of ${maxFiles} files reached` : description}
        onFiles={(files) => {
          setErrors([])
          onValueChange([...value, ...files].slice(0, maxFiles))
        }}
        onReject={setErrors}
      />
      {errors.length > 0 && (
        <ul role="alert" className="text-sm text-destructive">
          {errors.map(({ file, reason }) => (
            <li key={file.name}>{file.name}: {reason}</li>
          ))}
        </ul>
      )}
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-lg border p-2 text-sm">
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">{formatBytes(file.size)}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${file.name}`}
                onClick={() => onValueChange(value.filter((_, j) => j !== i))}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileUpload }
