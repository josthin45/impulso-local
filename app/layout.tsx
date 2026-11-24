import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "ImpulsoLocal · microvoluntariado",
  description:
    "Retos breves de comunidad para estudiantes. La coincidencia se explica y la plaza se confirma a mano.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${fraunces.variable} antialiased`}>
        <Providers>
          <Suspense>
            <Shell>{children}</Shell>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
