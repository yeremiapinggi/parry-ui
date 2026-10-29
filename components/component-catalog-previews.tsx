"use client"

import { useState } from "react"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ChevronDownIcon, CopyIcon, MinusIcon, PlusIcon, SearchIcon } from "lucide-react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { BorderButton } from "@/components/ui/border-button"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ButtonGroup } from "@/components/ui/button-group"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { GithubStars } from "@/components/ui/github-stars"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { LoginButton } from "@/components/ui/login-button"
import { MiniCalendar } from "@/components/ui/mini-calendar"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { SocialButton } from "@/components/ui/social-button"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
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
