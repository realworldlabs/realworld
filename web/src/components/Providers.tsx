"use client";

import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 3_000, retry: 1 } } }));
  const theme = lightTheme({ accentColor: "#0f5b3f", accentColorForeground: "#f3eee2", borderRadius: "none", fontStack: "system" });
  theme.colors.connectButtonBackground = "#16150f";
  theme.colors.connectButtonText = "#f3eee2";
  theme.colors.connectButtonInnerBackground = "#2a2820";
  theme.colors.modalBackground = "#faf7ef";
  theme.colors.modalBorder = "#c4bba2";
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
