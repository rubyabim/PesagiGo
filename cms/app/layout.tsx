import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// Import komponen proteksi halaman dashboard
import AuthGuard from "@/components/dashboard/auth-guard";

// Import provider global aplikasi
import AppProviders from "@/components/providers/app-providers";

// Import file CSS global
import "./globals.css";

// Konfigurasi font Geist Sans
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Konfigurasi font Geist Mono
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata website / aplikasi
export const metadata: Metadata = {
  title: "PesagiGo CMS",
  description:
    "CMS admin untuk manajemen rute, booking, pembayaran, dan kuota",
};

// Root layout utama aplikasi Next.js
export default function RootLayout({
  children,
}: Readonly<{
  // Children digunakan untuk menampilkan seluruh halaman
  children: React.ReactNode;
}>) {
  return (
    <html
      // Bahasa utama website
      lang="en"

      // Menghindari warning hydration dari Next.js
      suppressHydrationWarning

      // Menambahkan font dan styling global
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        // Styling body utama
        className="min-h-full flex flex-col"
      >
        {/* Provider global aplikasi */}
        <AppProviders>

          {/* Proteksi halaman agar hanya user login yang bisa akses */}
          <AuthGuard>

            {/* Menampilkan isi halaman */}
            {children}

          </AuthGuard>
        </AppProviders>
      </body>
    </html>
  );
}