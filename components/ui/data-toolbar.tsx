"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"
import { Columns3Icon, SearchIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"
import type { DataTableInstance } from "@/components/ui/data-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

// Search box + column visibility menu for a DataTable; put extra filters in `children`.
function DataToolbar<TData extends RowData>({
  table,
  searchPlaceholder = "Search…",
  className,
  children,
}: {
  table: DataTableInstance<TData>
  searchPlaceholder?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div data-slot="data-toolbar" className={cn("flex flex-wrap items-center gap-2", className)}>
      <InputGroup className="w-full sm:w-60">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search rows"
          placeholder={searchPlaceholder}
          value={String(table.state.globalFilter ?? "")}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
      </InputGroup>
      {children}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Columns3Icon /> Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          {table
            .getAllLeafColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(visible) => column.toggleVisibility(visible)}
                onSelect={(e) => e.preventDefault()}
              >
                {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id.charAt(0).toUpperCase() + column.id.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export { DataToolbar }
