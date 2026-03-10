import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Krushit - Smart Farming Assistant",
  description: "AI + IoT powered smart farming assistant for modern farmers. Monitor crops, detect diseases, and get personalized recommendations.",
  keywords: ["agriculture", "farming", "AI", "IoT", "crop monitoring", "disease detection", "smart farming"],
  authors: [{ name: "Krushit Team" }],
  creator: "Krushit",
  publisher: "Krushit",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Krushit",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Krushit",
    title: "Krushit - Smart Farming Assistant",
    description: "AI + IoT powered smart farming assistant for modern farmers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krushit - Smart Farming Assistant",
    description: "AI + IoT powered smart farming assistant for modern farmers",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <NotificationProvider>
            <I18nProvider>{children}</I18nProvider>
          </NotificationProvider>
          {/* Dev Helper: Clear service workers to prevent Workbox 404s */}
          <script dangerouslySetInnerHTML={{ __html: `
            if ('serviceWorker' in navigator && window.location.hostname === 'localhost') {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    for(let registration of registrations) {
                        registration.unregister();
                        console.log('Stale ServiceWorker unregistered');
                    }
                });
                if (window.caches) {
                    caches.keys().then(names => {
                        for(let name of names) caches.delete(name);
                    });
                }
            }
          `}} />
        </AuthProvider>
      </body>
    </html>
  );
}
