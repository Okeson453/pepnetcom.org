import type { Metadata } from "next";
import { spaceGrotesk, ibmPlexSans, ibmPlexMono } from "@/styles/fonts";
import "@/styles/globals.css";
import { TRPCProvider } from "@/lib/trpc/client";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/feedback/toast";

export const metadata: Metadata = {
  title: "PEPNETCOM — One Network. Six Signals.",
  description:
    "PEPNETCOM connects academic support, trading intelligence, education consulting, and marketing into a single, trusted signal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <SessionProvider>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
