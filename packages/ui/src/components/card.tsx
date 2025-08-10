/**
 * @fileoverview Card Components - การ์ดสำหรับแสดงข้อมูล
 * 
 * Card components เป็นพื้นฐานสำหรับแสดงข้อมูลใน Basket.fi:
 * - Card: Container หลัก
 * - CardHeader: ส่วนหัวของการ์ด
 * - CardTitle: หัวข้อหลัก
 * - CardDescription: คำอธิบายเพิ่มเติม
 * - CardContent: เนื้อหาหลัก
 * - CardFooter: ส่วนท้ายของการ์ด (ปุ่ม actions)
 * 
 * ใช้สำหรับแสดง baskets, tokens, statistics, และข้อมูลอื่นๆ
 */

import * as React from "react";
import { cn } from "@basket-fi/utils";  // Utility สำหรับ merge classNames

/**
 * Card Container - พื้นฐานของการ์ด
 * มี border, shadow, และ rounded corners
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",  // การ์ดพื้นฐาน
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * CardHeader - ส่วนหัวของการ์ด
 * ใช้สำหรับใส่ title และ description
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}  // Flex column พร้อม spacing
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle - หัวข้อหลักของการ์ด
 * ใช้ h3 element สำหรับ semantic HTML
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",  // Typography สำหรับหัวข้อ
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardDescription - คำอธิบายเพิ่มเติม
 * ใช้สำหรับข้อความอธิบายใต้หัวข้อ
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}  // ข้อความเล็กสีเทา
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * CardContent - เนื้อหาหลักของการ์ด
 * ใช้สำหรับใส่ข้อมูลหลัก
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />  // Padding ยกเว้นด้านบน
));
CardContent.displayName = "CardContent";

/**
 * CardFooter - ส่วนท้ายของการ์ด
 * ใช้สำหรับใส่ปุ่ม actions
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}  // Flex row สำหรับปุ่ม
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };