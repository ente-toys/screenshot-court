import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: [
    { path: "../fonts/Geist-Regular.ttf", weight: "400" },
    { path: "../fonts/Geist-Medium.ttf", weight: "500" },
    { path: "../fonts/Geist-SemiBold.ttf", weight: "600" },
    { path: "../fonts/Geist-Bold.ttf", weight: "700" },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const pressStart = localFont({
  src: "../fonts/PressStart2P-Regular.ttf",
  variable: "--font-pixel",
  display: "swap",
});

const silkscreen = localFont({
  src: [
    { path: "../fonts/Silkscreen-Regular.ttf", weight: "400" },
    { path: "../fonts/Silkscreen-Bold.ttf", weight: "700" },
  ],
  variable: "--font-pixel-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Screenshot Court",
  description:
    "Upload a screenshot of a text conversation. Get a verdict, charges, and a calm reply.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${pressStart.variable} ${silkscreen.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
