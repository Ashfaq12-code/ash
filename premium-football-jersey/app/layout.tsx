import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PEROIM – Premium Football Jerseys | Official Store",
  description: "Shop the finest premium football jerseys from top clubs worldwide. Authentic designs, superior quality fabric, fast delivery. Your game. Your jersey. Your identity.",
  keywords: "football jersey, premium jersey, football kit, soccer jersey, official jersey store",
  openGraph: {
    title: "PEROIM – Premium Football Jerseys",
    description: "Shop the finest premium football jerseys from top clubs worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
