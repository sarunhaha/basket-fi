/**
 * @fileoverview Home Page - หน้าแรกของ Basket.fi
 * 
 * หน้านี้เป็น landing page ที่:
 * - แสดงข้อความต้อนรับ
 * - อธิบายฟีเจอร์หลักของแอป
 * - มีปุ่มไปยัง dashboard
 * 
 * ใช้ Next.js App Router และ Tailwind CSS สำหรับ styling
 */

import { Button } from "@basket-fi/ui";  // UI component จาก shared package
import Link from "next/link";            // Next.js Link component

/**
 * Home Page Component
 * หน้าแรกที่ผู้ใช้เห็นเมื่อเข้าเว็บ
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        {/* หัวข้อหลัก */}
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Basket-Fi
        </h1>
        
        {/* คำอธิบายแอป */}
        <p className="text-center text-lg mb-8">
          Create, track, and rebalance token baskets on Monad
        </p>
        
        {/* ปุ่มไปยัง dashboard */}
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}