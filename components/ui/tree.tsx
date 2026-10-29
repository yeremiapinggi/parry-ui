"use client"

import * as React from "react"
import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react"

import { cn } from "cn"

type TreeNode = { id: string; label: string; icon?: React.ReactNode; children?: TreeNode[] }

// Nested disclosure list: folders toggle open, leaves are selectable. Each row is a real button, so Tab and
// Enter/Space work without a roving-focus tree widget.
function Tree({
  items,
  defaultExpanded = [],
  selected,
  onSelect,
  showIcons = true,
  className,
  "aria-label": ariaLabel,
}: {
  items: TreeNode[]
  defaultExpanded?: string[]
  selected?: string
  onSelect?: (id: string) => void
  showIcons?: boolean
  className?: string
  "aria-label"?: string
}) {
  const [expanded, setExpanded] = React.useState(() => new Set(defaultExpanded))
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const render = (nodes: TreeNode[], depth: number): React.ReactNode => (
    <ul className={cn(depth > 0 && "ml-3.5 border-l pl-1.5")}>
      {nodes.map((node) => {
        const isFolder = !!node.children?.length
        const isOpen = expanded.has(node.id)
        const icon = node.icon ?? (isFolder ? isOpen ? <FolderOpenIcon /> : <FolderIcon /> : <FileIcon />)
        return (
          <li key={node.id}>
            <button
              type="button"
              aria-expanded={isFolder ? isOpen : undefined}
              aria-current={!isFolder && node.id === selected ? "true" : undefined}
              onClick={() => (isFolder ? toggle(node.id) : onSelect?.(node.id))}
              className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=true]:bg-muted aria-[current=true]:font-medium"
            >
              <ChevronRightIcon className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90", !isFolder && "invisible")} />
              {showIcons && <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>}
              <span className="truncate">{node.label}</span>
            </button>
            {isFolder && isOpen && render(node.children!, depth + 1)}
          </li>
        )
      })}
    </ul>
  )

  return (
    <nav data-slot="tree" aria-label={ariaLabel} className={className}>
      {render(items, 0)}
    </nav>
  )
}

export { Tree, type TreeNode }
