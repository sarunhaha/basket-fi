/**
 * @fileoverview Root Layout - Layout หลักของ Basket.fi Web App
 * 
 * ไฟล์นี้เป็น root layout ของ Next.js App Router ที่:
 * - กำหนด metadata สำหรับ SEO
 * - ตั้งค่า font (Inter) สำหรับทั้งแอป
 * - ครอบ providers ทั้งหมด (Theme, Wallet, Toast)
 * - กำหนด viewport และ theme colors
 * 
 * Layout นี้จะครอบทุกหน้าในแอป
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';           // Google Font
import { ThemeProvider } from '@/components/theme-provider';    // Dark/Light theme
import { WalletProvider } from '@/components/wallet-provider';  // Web3 wallet connection
import { Toaster } from '@/components/ui/toaster';             // Toast notifications
import './globals.css';                             // Global CSS styles

// กำหนด Inter font สำหรับทั้งแอป
const inter = Inter({ subsets: ['latin'] });

/**
 * Metadata สำหรับ SEO และ social sharing
 */
export const metadata: Metadata = {
  title: 'Basket.fi - DeFi Portfolio Management',                    // หัวข้อหลัก
  description: 'Create, manage, and rebalance your DeFi token portfolios with ease.', // คำอธิบาย
  keywords: ['DeFi', 'portfolio', 'crypto', 'blockchain', 'tokens'], // คำค้นหา
  authors: [{ name: 'Basket.fi Team' }],                            // ผู้เขียน
};

/**
 * Viewport configuration สำหรับ responsive design
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },  // สีธีม light mode
    { media: '(prefers-color-scheme: dark)', color: 'black' },   // สีธีม dark mode
  ],
};

/**
 * Root Layout Component
 * ครอบทุกหน้าในแอปด้วย providers และ global styles
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Theme Provider - จัดการ dark/light mode */}
        <ThemeProvider
          attribute="class"                    // ใช้ class attribute สำหรับ theme
          defaultTheme="system"               // ใช้ system preference เป็นค่าเริ่มต้น
          enableSystem                        // เปิดใช้ system theme detection
          disableTransitionOnChange          // ปิด transition เมื่อเปลี่ยน theme
        >
          {/* Wallet Provider - จัดการ Web3 wallet connections */}
          <WalletProvider>
            <div className="min-h-screen bg-background">
              {children}  {/* หน้าต่างๆ ของแอป */}
            </div>
            {/* Toast Notifications - แสดงการแจ้งเตือน */}
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}