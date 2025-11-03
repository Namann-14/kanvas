import "./global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

const inter = Inter({
  subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <RootProvider>
          <DocsLayout tree={source.pageTree}>{children}</DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
