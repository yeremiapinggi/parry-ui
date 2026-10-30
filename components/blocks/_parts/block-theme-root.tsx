"use client"

import { useEffect } from "react"

import { applyBlockTheme, isBlockTheme } from "@/components/blocks/_parts/block-themes"

// Applies ?theme= (read on the client so the route stays prerenderable) and restores the site theme on leave.
// Without ?theme= it keeps the current preset, so moving between blocks keeps the theme.
export function BlockThemeRoot() {
  useEffect(() => {
    const html = document.documentElement
    const saved = { className: html.className, colorScheme: html.style.colorScheme }
    const param = new URLSearchParams(window.location.search).get("theme")
    applyBlockTheme(isBlockTheme(param) ? param : isBlockTheme(html.dataset.theme) ? html.dataset.theme : "classic")
    return () => {
      delete html.dataset.theme
      html.className = saved.className
      html.style.colorScheme = saved.colorScheme
    }
  }, [])
  return null
}
