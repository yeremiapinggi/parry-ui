import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, CircleCheckIcon, OctagonXIcon, PlusIcon } from "lucide-react";

import { DialogDemo, DropdownMenuDemo, ToastDemo, TooltipDemo } from "@/components/overlay-demo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = { title: "Components · Parry UI" };

// Every `name` is a registry item, so it doubles as the anchor id and the `@parry/<name>` install name.
const groups: { title: string; items: { name: string; preview: ReactNode }[] }[] = [
  {
    title: "Action",
    items: [
      {
        name: "button",
        preview: (
          <div className="flex flex-wrap justify-center gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
          </div>
        ),
      },
    ],
  },
  {
    title: "Form",
    items: [
      {
        name: "input",
        preview: (
          <div className="flex w-full max-w-60 flex-col gap-2">
            <Input aria-label="Email" placeholder="name@ivosights.com" />
            <Input aria-label="Invalid email" defaultValue="not-an-email" aria-invalid />
            <Input aria-label="Disabled email" placeholder="Disabled" disabled />
          </div>
        ),
      },
      {
        name: "label",
        preview: (
          <div className="flex items-center gap-2">
            <Checkbox id="label-demo" />
            <Label htmlFor="label-demo">Remember me</Label>
          </div>
        ),
      },
      {
        name: "textarea",
        preview: <Textarea aria-label="Notes" placeholder="Write a note…" className="max-w-60" />,
      },
      {
        name: "select",
        preview: (
          <Select>
            <SelectTrigger aria-label="Role" className="w-48">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        name: "checkbox",
        preview: (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id="cb-1" defaultChecked />
              <Label htmlFor="cb-1">Weekly report</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-2" />
              <Label htmlFor="cb-2">Monthly summary</Label>
            </div>
          </div>
        ),
      },
      {
        name: "switch",
        preview: (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Switch id="sw-1" defaultChecked />
              <Label htmlFor="sw-1">Email notifications</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sw-2" />
              <Label htmlFor="sw-2">Focus mode</Label>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    title: "Feedback",
    items: [
      {
        name: "alert",
        preview: (
          <div className="flex w-full flex-col gap-2">
            <Alert className="border-success/30 bg-success-soft text-success">
              <CircleCheckIcon />
              <AlertTitle>Saved successfully</AlertTitle>
            </Alert>
            <Alert variant="destructive">
              <OctagonXIcon />
              <AlertTitle>Connection failed</AlertTitle>
              <AlertDescription>Check your connection and try again.</AlertDescription>
            </Alert>
          </div>
        ),
      },
      {
        name: "badge",
        preview: (
          <div className="flex flex-wrap justify-center gap-2">
            <Badge>default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="outline">outline</Badge>
            <Badge className="border-success/30 bg-success-soft text-success">success</Badge>
            <Badge className="border-warning/30 bg-warning-soft text-warning">warning</Badge>
            <Badge className="border-info/30 bg-info-soft text-info">info</Badge>
          </div>
        ),
      },
      { name: "sonner", preview: <ToastDemo /> },
      {
        name: "skeleton",
        preview: (
          <div className="flex w-full max-w-60 items-center gap-3" aria-busy="true" aria-label="Loading">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ),
      },
    ],
  },
  {
    title: "Overlay",
    items: [
      { name: "dialog", preview: <DialogDemo /> },
      { name: "dropdown-menu", preview: <DropdownMenuDemo /> },
      { name: "tooltip", preview: <TooltipDemo /> },
    ],
  },
  {
    title: "Layout & data",
    items: [
      {
        name: "card",
        preview: (
          <Card className="w-full max-w-60">
            <CardHeader>
              <CardDescription>Total Components</CardDescription>
              <CardTitle className="text-2xl">19</CardTitle>
            </CardHeader>
          </Card>
        ),
      },
      {
        name: "tabs",
        preview: (
          <Tabs defaultValue="overview" className="w-full max-w-60">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-2 text-sm text-muted-foreground">Project summary.</TabsContent>
            <TabsContent value="tokens" className="pt-2 text-sm text-muted-foreground">List of color tokens.</TabsContent>
          </Tabs>
        ),
      },
      {
        name: "table",
        preview: (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Jordan Doe</TableCell>
                <TableCell className="text-right"><Badge variant="secondary">Active</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Budi Tan</TableCell>
                <TableCell className="text-right"><Badge variant="outline">Invited</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ),
      },
      {
        name: "separator",
        preview: (
          <div className="flex w-full max-w-60 flex-col gap-3 text-sm">
            <p className="font-medium">Parry UI</p>
            <Separator />
            <div className="flex h-4 items-center gap-3 text-muted-foreground">
              Docs <Separator orientation="vertical" /> Components <Separator orientation="vertical" /> Themes
            </div>
          </div>
        ),
      },
      {
        name: "avatar",
        preview: (
          <div className="flex -space-x-2">
            {["JD", "SR", "BT"].map((i) => (
              <Avatar key={i} className="ring-2 ring-card">
                <AvatarFallback>{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        ),
      },
    ],
  },
];

const label = (name: string) => name.replace("-", " ");

export default function ComponentsPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 lg:grid-cols-[200px_1fr]">
      <aside className="hidden lg:block">
        <nav aria-label="Components" className="sticky top-14 flex max-h-[calc(100vh-3.5rem)] flex-col gap-5 overflow-y-auto py-8 text-sm">
          {groups.map((g) => (
            <div key={g.title} className="flex flex-col gap-1">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{g.title}</p>
              {g.items.map(({ name }) => (
                <a key={name} href={`#${name}`} className="rounded-md px-2 py-1 capitalize text-muted-foreground hover:bg-muted hover:text-foreground">
                  {label(name)}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col gap-12 py-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight">Browse the library</h1>
          <p className="max-w-xl text-muted-foreground">
            19 shadcn components with the Parry theme. Install them one at a time with{" "}
            <code className="font-mono text-sm">npx shadcn@latest add @parry/&lt;name&gt;</code>.
          </p>
          <div className="flex gap-2">
            <Button asChild className="rounded-full">
              <Link href="/docs">Installation</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/themes">View theme</Link>
            </Button>
          </div>
        </header>

        {groups.map((g) => (
          <section key={g.title} className="flex flex-col gap-4" aria-labelledby={`group-${g.title}`}>
            <h2 id={`group-${g.title}`} className="font-heading text-xl font-semibold">{g.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {g.items.map(({ name, preview }) => (
                <div key={name} id={name} className="flex scroll-mt-20 flex-col gap-2">
                  <div className="flex min-h-48 flex-1 items-center justify-center rounded-xl border bg-card p-6">{preview}</div>
                  <div className="flex items-center justify-between gap-2 px-1">
                    <h3 className="text-sm font-medium capitalize">{label(name)}</h3>
                    <code className="truncate font-mono text-xs text-muted-foreground">@parry/{name}</code>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <Link href="/themes" className="inline-flex items-center gap-1 self-center text-sm font-medium text-primary hover:underline">
          See the color tokens on Themes <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
