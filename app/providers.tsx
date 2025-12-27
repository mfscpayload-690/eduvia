"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { RecommendationProvider } from "@/components/rec-engine/recommendation-context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <RecommendationProvider>{children}</RecommendationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
