import type { Metadata } from "next";
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SocketWrapper } from "@/components/socket-wrapper"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ELMS - E-Learning Management System",
  description: "Modern E-Learning Management System built with Next.js and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <SocketWrapper>
              {children}
              <Toaster />
            </SocketWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
