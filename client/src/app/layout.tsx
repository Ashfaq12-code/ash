import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SonicBots — Secure Neural Chat",
  description: "Encrypted real-time chat, multiplayer Ludo, and AI-powered conversations.",
  icons: {
    icon: "https://i.ibb.co/svVJ0ypd/Gemini-Generated-Image-45eonv45eonv45eo-1.png",
    shortcut: "https://i.ibb.co/svVJ0ypd/Gemini-Generated-Image-45eonv45eonv45eo-1.png",
    apple: "https://i.ibb.co/svVJ0ypd/Gemini-Generated-Image-45eonv45eonv45eo-1.png",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="https://i.ibb.co/svVJ0ypd/Gemini-Generated-Image-45eonv45eonv45eo-1.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#050810] text-white overflow-x-hidden">{children}</body>
    </html>
  );
}
