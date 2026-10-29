export type ControlSize = "sm" | "md" | "lg"

export const controlSizeClasses: Record<ControlSize, string> = {
  sm: "h-control-sm rounded-control-sm px-control-pad-sm text-control-sm",
  md: "h-control-md rounded-control-md px-control-pad-md text-control-md",
  lg: "h-control-lg rounded-control-lg px-control-pad-lg text-control-lg",
}

export const controlTriggerSizeClasses: Record<ControlSize, string> = {
  sm: `${controlSizeClasses.sm} !rounded-control-sm gap-1.5 [&_svg:not([class*='size-'])]:size-control-icon-sm`,
  md: `${controlSizeClasses.md} !rounded-control-md gap-2 [&_svg:not([class*='size-'])]:size-control-icon-md`,
  lg: `${controlSizeClasses.lg} !rounded-control-lg gap-2 [&_svg:not([class*='size-'])]:size-control-icon-lg`,
}

export const controlTriggerBaseClasses =
  "inline-flex w-fit min-w-0 items-center justify-between border border-input bg-card font-normal text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

export const controlIconSizeClasses: Record<ControlSize, string> = {
  sm: "size-control-icon-sm",
  md: "size-control-icon-md",
  lg: "size-control-icon-lg",
}
