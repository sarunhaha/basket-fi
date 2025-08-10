/**
 * @fileoverview ClassName Utility - สำหรับ merge Tailwind CSS classes
 * 
 * Function นี้ใช้สำหรับรวม CSS classes โดย:
 * - ใช้ clsx สำหรับ conditional classes
 * - ใช้ tailwind-merge สำหรับ resolve conflicts ระหว่าง Tailwind classes
 * 
 * @example
 * cn("px-2 py-1", "px-4") // Result: "py-1 px-4" (px-4 overrides px-2)
 * cn("text-red-500", condition && "text-blue-500") // Conditional classes
 */

import { type ClassValue, clsx } from "clsx";        // สำหรับ conditional classes
import { twMerge } from "tailwind-merge";            // สำหรับ merge Tailwind classes

/**
 * Combine และ merge CSS classes อย่างชาญฉลาด
 * 
 * @param inputs - Array ของ class values (strings, objects, arrays)
 * @returns Merged className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}