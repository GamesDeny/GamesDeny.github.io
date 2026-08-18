import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/config/contact";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — Software Engineer`,
  description: `Personal portfolio of ${siteConfig.name}, Software Engineer.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-text-primary font-mono">
        <I18nProvider>
          <Navbar siteName={siteConfig.name} />
          <main className="flex-1 pt-14">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
