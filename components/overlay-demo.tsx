"use client"

import { CopyIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function OverlayDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Buka dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus proyek?</DialogTitle>
            <DialogDescription>
              Proyek &ldquo;Kampanye Q4&rdquo; dan semua datanya akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive">Hapus</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Aksi lain">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Proyek</DropdownMenuLabel>
          <DropdownMenuItem>
            <PencilIcon /> Ubah <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CopyIcon /> Duplikat <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <TrashIcon /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Arahkan ke sini</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip memakai warna foreground/background terbalik</TooltipContent>
      </Tooltip>

      <Button variant="secondary" onClick={() => toast("Perubahan disimpan")}>Toast</Button>
      <Button variant="secondary" onClick={() => toast.success("Proyek dipublikasikan")}>Toast sukses</Button>
      <Button variant="secondary" onClick={() => toast.error("Gagal menyimpan")}>Toast error</Button>
    </div>
  )
}
