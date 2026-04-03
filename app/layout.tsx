import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "./lib/i18n";
import { ChatProvider } from "./lib/ChatContext";
import { ThemeProvider } from "./lib/ThemeContext";
import QueryProvider from "./lib/QueryProvider";

export const metadata: Metadata = {
  title: "Bibleway — The Modern Sanctuary",
  description:
    "A faith-based community platform for Bible reading, prayer, and fellowship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body antialiased">
        <QueryProvider><ThemeProvider><I18nProvider><ChatProvider>{children}</ChatProvider></I18nProvider></ThemeProvider></QueryProvider>
      </body>
    </html>
  );
}
