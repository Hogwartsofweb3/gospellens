import type { Metadata } from "next";
import { Poppins, Inter, Lora } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gospellens.app";

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Gospel Lens — Every trusted Christian voice, one place",
    template: "%s — Gospel Lens",
  },
  description:
    "Gospel Lens curates trusted Christian sermons, articles, podcasts, and worship from verified ministries around the world.",
  keywords: ["Christian content", "sermons", "gospel", "Bible", "ministry", "podcasts", "worship"],
  authors: [{ name: "Gospel Lens" }],
  creator: "Gospel Lens",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Gospel Lens",
    title: "Gospel Lens — Every trusted Christian voice, one place",
    description:
      "Gospel Lens curates trusted Christian sermons, articles, podcasts, and worship from verified ministries around the world.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Gospel Lens" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gospel Lens — Every trusted Christian voice, one place",
    description:
      "Gospel Lens curates trusted Christian sermons, articles, podcasts, and worship from verified ministries around the world.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: BASE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} ${lora.variable} bg-background text-text-primary min-h-screen`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
