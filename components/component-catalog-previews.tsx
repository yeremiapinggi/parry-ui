"use client"

import { useState } from "react"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ChevronDownIcon, CopyIcon, PencilIcon, HomeIcon, InboxIcon, InfoIcon, SearchXIcon, MinusIcon, PlusIcon, SearchIcon, SettingsIcon, Trash2Icon, UsersIcon } from "lucide-react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Announcement, AnnouncementTag, AnnouncementTitle } from "@/components/ui/announcement"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Autocomplete } from "@/components/ui/autocomplete"
import { Banner } from "@/components/ui/banner"
import { BorderButton } from "@/components/ui/border-button"
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ButtonGroup } from "@/components/ui/button-group"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Choicebox, ChoiceboxItem } from "@/components/ui/choicebox"
import { ColorPicker } from "@/components/ui/color-picker"
import { Combobox } from "@/components/ui/combobox"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { DatePicker } from "@/components/ui/date-picker"
import { DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogStack, DialogStackFooter, DialogStackNext, DialogStackPrevious } from "@/components/ui/dialog-stack"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Dropzone } from "@/components/ui/dropzone"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FileUpload } from "@/components/ui/file-upload"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { GithubStars } from "@/components/ui/github-stars"
import { Glimpse, GlimpseContent, GlimpseDescription, GlimpseImage, GlimpseTitle, GlimpseTrigger } from "@/components/ui/glimpse"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { LoginButton } from "@/components/ui/login-button"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar"
import { MiniCalendar } from "@/components/ui/mini-calendar"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Rating } from "@/components/ui/rating"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { SocialButton } from "@/components/ui/social-button"
import { Spinner } from "@/components/ui/spinner"
import { Status } from "@/components/ui/status"
import { Switch } from "@/components/ui/switch"
import { TagsInput } from "@/components/ui/tags-input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const weeklyRequests = [
  { day: "Mon", requests: 28 },
  { day: "Tue", requests: 42 },
  { day: "Wed", requests: 35 },
  { day: "Thu", requests: 56 },
  { day: "Fri", requests: 48 },
]

const requestsConfig = {
  requests: { label: "Requests", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ChartCatalogPreview() {
  return (
    <ChartContainer
      config={requestsConfig}
      className="h-36 min-h-36 w-full aspect-auto"
      role="img"
      aria-label="Bar chart showing daily requests from Monday to Friday"
    >
      <BarChart data={weeklyRequests} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="requests" fill="var(--color-requests)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function PopoverCatalogPreview() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Filter status <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <PopoverHeader>
          <PopoverTitle>Status</PopoverTitle>
          <PopoverDescription>Choose which records to show.</PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-3 px-1 py-2">
          <div className="flex items-center gap-2">
            <Checkbox id="catalog-status-active" defaultChecked />
            <Label htmlFor="catalog-status-active">Active</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="catalog-status-pending" />
            <Label htmlFor="catalog-status-pending">Pending</Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function RadioGroupCatalogPreview() {
  return (
    <RadioGroup defaultValue="comfortable" aria-label="Display density" className="w-full max-w-56">
      <div className="flex items-center gap-2">
        <RadioGroupItem id="catalog-density-compact" value="compact" />
        <Label htmlFor="catalog-density-compact">Compact</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="catalog-density-comfortable" value="comfortable" />
        <Label htmlFor="catalog-density-comfortable">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="catalog-density-spacious" value="spacious" />
        <Label htmlFor="catalog-density-spacious">Spacious</Label>
      </div>
    </RadioGroup>
  )
}

export function ToggleGroupCatalogPreview() {
  return (
    <ToggleGroup type="single" defaultValue="grid" variant="outline" aria-label="Choose a display mode">
      <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
    </ToggleGroup>
  )
}

export function AspectRatioCatalogPreview() {
  return (
    <div className="grid w-full max-w-72 grid-cols-3 items-end gap-3">
      {[
        { label: "16:9", ratio: 16 / 9 },
        { label: "4:3", ratio: 4 / 3 },
        { label: "1:1", ratio: 1 },
      ].map(({ label, ratio }) => (
        <AspectRatio key={label} ratio={ratio} className="flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
          {label}
        </AspectRatio>
      ))}
    </div>
  )
}

const releases = ["v2.4.0", "v2.3.2", "v2.3.1", "v2.3.0", "v2.2.4", "v2.2.3", "v2.2.0", "v2.1.0"]
const channels = ["WhatsApp", "Instagram", "Facebook", "Email", "Live Chat", "Telegram", "X", "TikTok"]

export function ScrollAreaCatalogPreview() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-3">
      <ScrollArea className="h-32 rounded-md border">
        <div className="p-3 text-sm">
          <p className="pb-2 text-xs font-medium text-muted-foreground">Releases</p>
          {releases.map((release, i) => (
            <div key={release}>
              {i > 0 && <Separator className="my-2" />}
              {release}
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="w-full rounded-md border whitespace-nowrap">
        <div className="flex gap-2 p-2">
          {channels.map((channel) => (
            <span key={channel} className="rounded-full bg-muted px-2.5 py-1 text-xs">{channel}</span>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export function ResizableCatalogPreview() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="min-h-36 max-w-72 rounded-md border text-sm">
      <ResizablePanel defaultSize="40" minSize="25">
        <div className="flex h-full items-center justify-center p-3 text-muted-foreground">Sidebar</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="60">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="60">
            <div className="flex h-full items-center justify-center p-3 text-muted-foreground">Editor</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="40">
            <div className="flex h-full items-center justify-center p-3 text-muted-foreground">Terminal</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export function KbdCatalogPreview() {
  return (
    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>C</Kbd>
        </KbdGroup>
        <KbdGroup aria-label="Arrow keys">
          <Kbd><ArrowLeftIcon /></Kbd>
          <Kbd><ArrowUpIcon /></Kbd>
          <Kbd><ArrowDownIcon /></Kbd>
          <Kbd><ArrowRightIcon /></Kbd>
        </KbdGroup>
      </div>
      <p>
        Press <Kbd>Enter</Kbd> to send
      </p>
    </div>
  )
}

export function ButtonGroupCatalogPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-3">
        <ButtonGroup aria-label="Message actions">
          <Button variant="outline">Archive</Button>
          <Button variant="outline">Report</Button>
          <Button variant="outline">Snooze</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Publish">
          <Button>Publish</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" aria-label="More publish options" className="border-l border-primary-foreground/20">
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Schedule</DropdownMenuItem>
              <DropdownMenuItem>Save as draft</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
      <ButtonGroup orientation="vertical" aria-label="Zoom">
        <Button variant="outline" size="icon" aria-label="Zoom in"><PlusIcon /></Button>
        <Button variant="outline" size="icon" aria-label="Zoom out"><MinusIcon /></Button>
      </ButtonGroup>
    </div>
  )
}

export function SpinnerCatalogPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Spinner className="size-3" />
      <Spinner />
      <Spinner className="size-6" />
      <Button disabled>
        <Spinner />
        Saving
      </Button>
    </div>
  )
}

export function BorderButtonCatalogPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <BorderButton>Beam</BorderButton>
      <BorderButton border="gradient">Gradient</BorderButton>
      <BorderButton border="dashed">Dashed</BorderButton>
    </div>
  )
}

export function SocialButtonCatalogPreview() {
  return (
    <div className="flex w-full max-w-64 flex-col gap-2">
      <SocialButton provider="google" className="w-full" />
      <SocialButton provider="github" variant="default" className="w-full" />
      <div className="flex justify-center gap-2">
        <SocialButton provider="google" iconOnly />
        <SocialButton provider="microsoft" iconOnly />
        <SocialButton provider="github" iconOnly />
      </div>
    </div>
  )
}

export function LoginButtonCatalogPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <LoginButton />
      <LoginButton intent="email" variant="outline" />
      <LoginButton intent="signup" variant="secondary" />
      <LoginButton provider="github" variant="outline">Login with GitHub</LoginButton>
    </div>
  )
}

export function GithubStarsCatalogPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <GithubStars repo="shadcn-ui/ui" stars={98400} />
      <GithubStars repo="shadcn-ui/ui" stars={98400} showRepo />
    </div>
  )
}

export function FieldCatalogPreview() {
  return (
    <FieldGroup className="w-full max-w-64">
      <Field>
        <FieldLabel htmlFor="catalog-field-name">Workspace name</FieldLabel>
        <Input id="catalog-field-name" defaultValue="Ivosights" />
        <FieldDescription>Shown to everyone you invite.</FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="catalog-field-email">Billing email</FieldLabel>
        <Input id="catalog-field-email" defaultValue="finance@" aria-invalid aria-describedby="catalog-field-email-error" />
        <FieldError id="catalog-field-email-error">Enter a complete email address.</FieldError>
      </Field>
      <Field orientation="horizontal">
        <Switch id="catalog-field-digest" defaultChecked />
        <FieldLabel htmlFor="catalog-field-digest">Send weekly digest</FieldLabel>
      </Field>
      <FieldSet>
        <FieldLegend variant="label">Channels</FieldLegend>
        <Field orientation="horizontal">
          <Checkbox id="catalog-field-wa" defaultChecked />
          <FieldLabel htmlFor="catalog-field-wa">WhatsApp</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="catalog-field-ig" />
          <FieldLabel htmlFor="catalog-field-ig">Instagram</FieldLabel>
        </Field>
      </FieldSet>
    </FieldGroup>
  )
}

export function InputGroupCatalogPreview() {
  return (
    <div className="flex w-full max-w-64 flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search conversations" placeholder="Search conversations" />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Webhook URL" defaultValue="api.ivosights.com/hooks" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Copy URL">
            <CopyIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea aria-label="Ask the assistant" placeholder="Ask the assistant…" />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-xs">0/280</InputGroupText>
          <InputGroupButton variant="default" size="icon-xs" className="ml-auto rounded-full" aria-label="Send">
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled="true">
        <InputGroupInput aria-label="Checking availability" defaultValue="parry-ui" disabled />
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export function InputOTPCatalogPreview() {
  return (
    <div className="flex flex-col items-center gap-4">
      <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} aria-label="Verification code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <InputOTP maxLength={4} value="2486" disabled aria-label="Disabled PIN">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}

export function SliderCatalogPreview() {
  const [volume, setVolume] = useState([60])
  const [price, setPrice] = useState([20, 80])

  return (
    <div className="flex w-full max-w-60 flex-col gap-6 text-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label id="catalog-slider-volume">Volume</Label>
          <span className="text-muted-foreground tabular-nums">{volume[0]}%</span>
        </div>
        <Slider aria-labelledby="catalog-slider-volume" value={volume} onValueChange={setVolume} max={100} step={1} />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label id="catalog-slider-price">Price range</Label>
          <span className="text-muted-foreground tabular-nums">${price[0]} – ${price[1]}</span>
        </div>
        <Slider aria-labelledby="catalog-slider-price" value={price} onValueChange={setPrice} max={100} step={5} minStepsBetweenThumbs={1} />
      </div>
    </div>
  )
}

// Fixed demo date: prerendering can't read the current time (cacheComponents).
const demoToday = new Date(2026, 9, 29)

export function CalendarCatalogPreview() {
  const [range, setRange] = useState<DateRange | undefined>({ from: demoToday, to: addDays(demoToday, 4) })

  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      captionLayout="dropdown"
      today={demoToday}
      defaultMonth={demoToday}
      disabled={{ before: demoToday }}
      className="rounded-lg border"
    />
  )
}

export function DatePickerCatalogPreview() {
  const [date, setDate] = useState<Date>()
  return <DatePicker date={date} onDateChange={setDate} placeholder="Pick a due date" />
}

export function MiniCalendarCatalogPreview() {
  const [date, setDate] = useState(demoToday)
  return <MiniCalendar value={date} onValueChange={setDate} />
}

export function CommandCatalogPreview() {
  return (
    <Command className="w-full max-w-64 rounded-lg border">
      <CommandInput placeholder="Type a command…" />
      <CommandList className="max-h-44">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Go to">
          <CommandItem><InboxIcon /> Inbox <CommandShortcut>G I</CommandShortcut></CommandItem>
          <CommandItem><UsersIcon /> Contacts <CommandShortcut>G C</CommandShortcut></CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem><SettingsIcon /> Preferences <CommandShortcut>⌘,</CommandShortcut></CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const channelOptions = [
  { value: "whatsapp", label: "WhatsApp", group: "Messaging" },
  { value: "telegram", label: "Telegram", group: "Messaging" },
  { value: "instagram", label: "Instagram", group: "Social" },
  { value: "facebook", label: "Facebook", group: "Social" },
  { value: "email", label: "Email", group: "Other" },
]

export function ComboboxCatalogPreview() {
  const [channel, setChannel] = useState("instagram")
  return <Combobox aria-label="Channel" options={channelOptions} value={channel} onValueChange={setChannel} placeholder="Select a channel" searchPlaceholder="Search channels…" />
}

const cities = ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Medan", "Makassar", "Denpasar", "Semarang"]

export function AutocompleteCatalogPreview() {
  const [city, setCity] = useState("")
  return (
    <div className="w-full max-w-60">
      <Autocomplete aria-label="City" placeholder="Search a city…" value={city} onValueChange={setCity} suggestions={cities} />
    </div>
  )
}

export function ChoiceboxCatalogPreview() {
  return (
    <Choicebox defaultValue="pro" aria-label="Plan" className="w-full max-w-64">
      <ChoiceboxItem value="starter" title="Starter" description="Up to 3 channels" />
      <ChoiceboxItem value="pro" title="Pro" description="Unlimited channels and reports" />
      <ChoiceboxItem value="enterprise" title="Enterprise" description="Contact sales" disabled />
    </Choicebox>
  )
}

export function RatingCatalogPreview() {
  const [score, setScore] = useState(4)
  return (
    <div className="flex flex-col items-center gap-4 text-sm">
      <Field className="items-center">
        <FieldLabel id="catalog-rating-label">How was the agent&apos;s reply?</FieldLabel>
        <Rating aria-label="Agent reply rating" value={score} onValueChange={setScore} size="lg" />
      </Field>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Rating value={4} readOnly size="sm" aria-label="Average rating" />
        <span className="tabular-nums">4.0 · 128 reviews</span>
      </div>
    </div>
  )
}

export function TagsInputCatalogPreview() {
  const [tags, setTags] = useState(["vip", "jakarta"])
  return (
    <div className="w-full max-w-64">
      <TagsInput aria-label="Contact tags" value={tags} onValueChange={setTags} />
    </div>
  )
}

const brandSwatches = ["#171C24", "#3366E0", "#5B8DEF", "#93C5FD", "#15803D", "#B45309", "#C81E1E", "#64748B"]

export function ColorPickerCatalogPreview() {
  const [color, setColor] = useState("#3366E0")
  return <ColorPicker aria-label="Brand color" value={color} onValueChange={setColor} swatches={brandSwatches} />
}

export function DropzoneCatalogPreview() {
  const [file, setFile] = useState<File>()
  const [error, setError] = useState("")
  return (
    <div className="flex w-full max-w-64 flex-col gap-2 text-sm">
      <Dropzone
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        title={file ? file.name : "Upload a logo"}
        description="PNG, JPG or SVG up to 2 MB"
        onFiles={([next]) => {
          setFile(next)
          setError("")
        }}
        onReject={([rejection]) => setError(rejection.reason)}
      />
      {error && <p role="alert" className="text-destructive">{error}</p>}
    </div>
  )
}

export function FileUploadCatalogPreview() {
  const [files, setFiles] = useState<File[]>([])
  return (
    <div className="w-full max-w-64">
      <FileUpload value={files} onValueChange={setFiles} accept=".pdf,.csv,image/*" maxSize={10 * 1024 * 1024} maxFiles={3} description="PDF, CSV or images, up to 3 files" />
    </div>
  )
}

export function ProgressCatalogPreview() {
  return (
    <div className="flex w-full max-w-60 flex-col gap-4 text-sm">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span id="catalog-progress-import">Importing contacts</span>
          <span className="text-muted-foreground tabular-nums">64%</span>
        </div>
        <Progress value={64} aria-labelledby="catalog-progress-import" />
      </div>
      <Progress value={35} aria-label="Storage used" className="h-2 [&>[data-slot=progress-indicator]]:bg-success" />
    </div>
  )
}

export function EmptyCatalogPreview() {
  return (
    <Empty className="border border-dashed p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>No conversations found</EmptyTitle>
        <EmptyDescription>Try another keyword or clear the filters.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">Clear filters</Button>
      </EmptyContent>
    </Empty>
  )
}

export function BannerCatalogPreview() {
  return (
    <div className="flex w-full flex-col gap-2">
      <Banner action={<Button size="xs" variant="secondary">Upgrade</Button>}>
        Your trial ends in 3 days.
      </Banner>
      <Banner variant="info" inset>
        <InfoIcon />
        Scheduled maintenance on Sunday, 02:00 WIB.
      </Banner>
    </div>
  )
}

export function AnnouncementCatalogPreview() {
  return (
    <Announcement asChild>
      <a href="#announcement">
        <AnnouncementTag>New</AnnouncementTag>
        <AnnouncementTitle>
          Developer Portal is live <ArrowRightIcon />
        </AnnouncementTitle>
      </a>
    </Announcement>
  )
}

export function StatusCatalogPreview() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Status status="online">API online</Status>
      <Status status="degraded" />
      <Status status="maintenance" />
      <Status status="offline" />
    </div>
  )
}

export function AlertDialogCatalogPreview() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete segment</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive-soft text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete &ldquo;VIP Jakarta&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>1,240 contacts stay in your workspace, but campaigns using this segment will stop.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function SheetCatalogPreview() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Edit contact</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit contact</SheetTitle>
          <SheetDescription>Changes are saved to the shared contact record.</SheetDescription>
        </SheetHeader>
        <FieldGroup className="px-4">
          <Field>
            <FieldLabel htmlFor="catalog-sheet-name">Name</FieldLabel>
            <Input id="catalog-sheet-name" defaultValue="Rina Wijaya" />
          </Field>
          <Field>
            <FieldLabel htmlFor="catalog-sheet-phone">Phone</FieldLabel>
            <Input id="catalog-sheet-phone" defaultValue="+62 812 3456 7890" />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function DrawerCatalogPreview() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Daily message goal</DrawerTitle>
            <DrawerDescription>Set how many replies your team aims for each day.</DrawerDescription>
          </DrawerHeader>
          <p className="py-4 text-center text-5xl font-bold tabular-nums">350</p>
          <DrawerFooter>
            <Button>Save goal</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export function HoverCardCatalogPreview() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@rina.wijaya</Button>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-72 gap-3">
        <Avatar>
          <AvatarFallback>RW</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-semibold">Rina Wijaya</p>
          <p className="text-muted-foreground">Support lead · handles VIP escalations for the Jakarta team.</p>
          <p className="text-xs text-muted-foreground">Joined March 2024</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function ContextMenuCatalogPreview() {
  const [pinned, setPinned] = useState(true)
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-28 w-full max-w-60 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem>
          <PencilIcon /> Rename <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <CopyIcon /> Duplicate <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Inbox</ContextMenuItem>
            <ContextMenuItem>Archive</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>Pinned</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2Icon /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function GlimpseCatalogPreview() {
  return (
    <p className="max-w-60 text-center text-sm text-muted-foreground">
      Read the{" "}
      <Glimpse>
        <GlimpseTrigger asChild>
          <a href="#glimpse" className="font-medium text-link underline-offset-4 hover:underline">settings guide</a>
        </GlimpseTrigger>
        <GlimpseContent>
          <GlimpseImage src="/images/settings-panels-thumbnail.png" />
          <GlimpseTitle>Settings panels</GlimpseTitle>
          <GlimpseDescription>Group preferences into panels with clear save and reset actions.</GlimpseDescription>
        </GlimpseContent>
      </Glimpse>{" "}
      before changing workspace defaults.
    </p>
  )
}

const onboardingSteps = [
  { title: "Connect a channel", description: "Link WhatsApp, Instagram or email so messages land in one inbox." },
  { title: "Invite your team", description: "Agents you invite can reply, assign and tag conversations." },
  { title: "Set office hours", description: "Outside these hours, customers get your away message." },
]

export function DialogStackCatalogPreview() {
  return (
    <DialogStack
      trigger={
        <DialogTrigger asChild>
          <Button variant="outline">Start setup</Button>
        </DialogTrigger>
      }
    >
      {onboardingSteps.map((step) => (
        <div key={step.title} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{step.title}</DialogTitle>
            <DialogDescription>{step.description}</DialogDescription>
          </DialogHeader>
          <DialogStackFooter>
            <DialogStackPrevious>Back</DialogStackPrevious>
            <DialogStackNext>Next</DialogStackNext>
          </DialogStackFooter>
        </div>
      ))}
    </DialogStack>
  )
}

export function BreadcrumbCatalogPreview() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#breadcrumb" aria-label="Home">
            <HomeIcon className="size-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#breadcrumb">Contacts</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Rina Wijaya</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function PaginationCatalogPreview() {
  const total = 10
  const [page, setPage] = useState(2)
  // Pages around the current one; 1 and the last page stay reachable through the ellipses.
  const pages = page <= 3 ? [1, 2, 3, 4] : page >= total - 2 ? [total - 3, total - 2, total - 1, total] : [page - 1, page, page + 1]
  const link = (n: number) => (
    <PaginationItem key={n}>
      <PaginationLink
        href="#pagination"
        isActive={n === page}
        onClick={(e) => {
          e.preventDefault()
          setPage(n)
        }}
      >
        {n}
      </PaginationLink>
    </PaginationItem>
  )
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#pagination"
            aria-disabled={page === 1}
            onClick={(e) => {
              e.preventDefault()
              setPage(Math.max(1, page - 1))
            }}
          />
        </PaginationItem>
        {pages[0] > 1 && (
          <>
            {link(1)}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}
        {pages.map(link)}
        {pages[pages.length - 1] < total && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            {link(total)}
          </>
        )}
        <PaginationItem>
          <PaginationNext
            href="#pagination"
            aria-disabled={page === total}
            onClick={(e) => {
              e.preventDefault()
              setPage(Math.min(total, page + 1))
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

const productLinks = [
  { title: "Inbox", description: "Every channel in one queue." },
  { title: "Analytics", description: "Response times and CSAT trends." },
  { title: "Developer Portal", description: "API keys, webhooks and logs." },
]

export function NavigationMenuCatalogPreview() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1">
              {productLinks.map((link) => (
                <li key={link.title}>
                  <NavigationMenuLink href="#navigation-menu" className="flex-col items-start gap-0.5">
                    <span className="font-medium">{link.title}</span>
                    <span className="text-muted-foreground">{link.description}</span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#navigation-menu" className={navigationMenuTriggerStyle()}>Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function MenubarCatalogPreview() {
  const [wrap, setWrap] = useState(true)
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New report <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
          <MenubarItem>Export CSV <MenubarShortcut>⌘E</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
          <MenubarItem>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={wrap} onCheckedChange={setWrap}>Wrap long rows</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
