import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "شركة عادل الحبيشي – نظام تقييم الخدمات",
  description:
    "منصة تقييم الموظفين والخدمات لشركة عادل الحبيشي للصرافة والتحويلات المالية.",
  icons: {
    icon: "/global.png",
    shortcut: "/global.png",
    apple: "/global.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/global.png" type="image/png" />
        <link rel="shortcut icon" href="/global.png" type="image/png" />
        <link rel="apple-touch-icon" href="/global.png" type="image/png" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
