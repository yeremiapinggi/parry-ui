import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { ProductThemeStyle } from "@/components/product-theme";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parry UI",
  description: "Ivosights design system built on shadcn/ui",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets the class on <html> before hydration
    <html lang="en" className="bg-background h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <SiteHeader />
            <div className="flex flex-1 flex-col">{children}</div>
            <SiteFooter />
          </TooltipProvider>
          <ProductThemeStyle />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
