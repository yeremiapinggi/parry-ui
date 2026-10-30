"use client"

import * as React from "react"
import { UploadIcon } from "lucide-react"

import { cn } from "cn"

type DropzoneRejection = { file: File; reason: string }

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

// Mirrors the input's accept attribute: ".pdf", "image/*" or "image/png".
function matchesAccept(file: File, accept?: string) {
  if (!accept) return true
  return accept.split(",").some((rule) => {
    const r = rule.trim().toLowerCase()
    if (r.startsWith(".")) return file.name.toLowerCase().endsWith(r)
    if (r.endsWith("/*")) return file.type.startsWith(r.slice(0, -1))
    return file.type === r
  })
}

function Dropzone({
  onFiles,
  onReject,
  accept,
  multiple = false,
  maxSize,
  disabled,
  title = "Drop files here or click to browse",
  description,
  className,
}: {
  onFiles: (files: File[]) => void
  onReject?: (rejections: DropzoneRejection[]) => void
  accept?: string
  multiple?: boolean
  // Bytes.
  maxSize?: number
  disabled?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const [dragging, setDragging] = React.useState(false)

  // Dropped files skip the input's accept filter and nothing enforces size, so validate both here.
  const handle = (list: FileList | null) => {
    const files = Array.from(list ?? []).slice(0, multiple ? undefined : 1)
    const accepted: File[] = []
    const rejected: DropzoneRejection[] = []
    for (const file of files) {
      if (!matchesAccept(file, accept)) rejected.push({ file, reason: "File type not allowed" })
      else if (maxSize && file.size > maxSize) rejected.push({ file, reason: `Larger than ${formatBytes(maxSize)}` })
      else accepted.push(file)
    }
    if (accepted.length) onFiles(accepted)
    if (rejected.length) onReject?.(rejected)
  }

  return (
    <div
      data-slot="dropzone"
      data-dragging={dragging}
      data-disabled={disabled}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (!disabled) handle(e.dataTransfer.files)
      }}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input p-6 text-center text-sm transition-colors has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 data-[dragging=true]:border-ring data-[dragging=true]:bg-info-soft/40 data-[disabled=true]:opacity-50",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        <UploadIcon className="size-4 text-muted-foreground" />
      </span>
      <span className="font-medium">{title}</span>
      {description && <span className="text-muted-foreground">{description}</span>}
      {/* Stretched over the whole zone so click, keyboard and screen readers all reach the native picker. */}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-label={typeof title === "string" ? title : "Upload files"}
        onChange={(e) => {
          handle(e.target.files)
          e.target.value = ""
        }}
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
    </div>
  )
}

export { Dropzone, formatBytes, type DropzoneRejection }
