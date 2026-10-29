import * as React from "react"
import { StarIcon } from "lucide-react"

import { cn } from "cn"
import { SocialIcon } from "@/components/ui/social-button"

const formatStars = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

// Pass `stars` from your own data source; the component never calls the GitHub API.
function GithubStars({
  repo,
  stars,
  showRepo = false,
  className,
  ...props
}: Omit<React.ComponentProps<"a">, "children"> & {
  repo: string
  stars: number
  showRepo?: boolean
}) {
  return (
    <a
      data-slot="github-stars"
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`${repo} on GitHub, ${stars.toLocaleString("en")} stars`}
      className={cn(
        "inline-flex h-8 items-stretch overflow-hidden rounded-lg border bg-background text-sm font-medium shadow-xs transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-1.5 px-2.5">
        <SocialIcon provider="github" />
        {showRepo ? repo : "Star"}
      </span>
      <span className="flex items-center gap-1 border-l px-2.5 tabular-nums">
        <StarIcon className="fill-warning text-warning" />
        {formatStars.format(stars)}
      </span>
    </a>
  )
}

export { GithubStars }
