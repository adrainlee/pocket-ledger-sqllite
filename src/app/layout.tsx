import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "口袋记账",
  description: "简单易用的移动端记账应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <main className="min-h-screen max-w-md mx-auto bg-gray-50">
          <div className="pb-16">
            {children}
          </div>
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
