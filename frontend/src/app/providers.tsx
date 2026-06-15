"use client";

import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "next-themes";
import { apolloClient } from "@/lib/apollo-client";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </ApolloProvider>
  );
}
