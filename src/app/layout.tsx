import type { Metadata } from "next";
import Providers from "@/components/providers";
import { Toaster } from "sonner";
import "./globals.css";
import { poppins } from "@/lib/utils/fonts";

export const metadata: Metadata = {
  title: "Order Timeline - Brightspeed Order Management",
  description: "Comprehensive order timeline and management system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
