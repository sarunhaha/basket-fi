/**
 * @fileoverview Next.js Middleware - จัดการ requests ก่อนถึง pages
 * 
 * Middleware นี้ทำหน้าที่:
 * - เพิ่ม security headers
 * - ข้าม middleware สำหรับ API routes และ static files
 * - จัดการ routing และ authentication (ในอนาคต)
 * 
 * ทำงานก่อนที่ request จะถึง page components
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware function - ประมวลผล requests ทั้งหมด
 * 
 * @param request - Next.js request object
 * @returns NextResponse with modifications
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ข้าม middleware สำหรับ API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ข้าม middleware สำหรับ static files
  if (
    pathname.startsWith('/_next/') ||      // Next.js internal files
    pathname.startsWith('/favicon.ico') || // Favicon
    pathname.startsWith('/robots.txt') ||  // SEO files
    pathname.startsWith('/sitemap.xml') || // Sitemap
    pathname.includes('.')                 // Files with extensions
  ) {
    return NextResponse.next();
  }

  // เพิ่ม security headers สำหรับความปลอดภัย
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');                           // ป้องกัน clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff');                // ป้องกัน MIME sniffing
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin'); // จำกัด referrer info

  return response;
}

/**
 * Middleware configuration
 * กำหนดว่า middleware จะทำงานกับ paths ไหนบ้าง
 */
export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)'  // ทำงานกับทุก path ยกเว้น internal files
  ]
};