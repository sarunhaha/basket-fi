/**
 * @fileoverview Formatting Utilities - สำหรับ format ข้อมูลต่างๆ
 * 
 * ไฟล์นี้รวม functions สำหรับ format:
 * - Currency: เงินตรา (USD, THB)
 * - Percentage: เปอร์เซ็นต์
 * - Token amounts: จำนวน tokens (จัดการ decimals)
 * - Addresses: Ethereum addresses (แสดงแบบย่อ)
 * - Time: เวลาแบบ relative (5m ago, 2h ago)
 * 
 * รองรับ internationalization (i18n) สำหรับภาษาไทยและอังกฤษ
 */

/**
 * Format จำนวนเงินเป็นรูปแบบสกุลเงิน
 * 
 * @param amount - จำนวนเงิน (string หรือ number)
 * @param currency - สกุลเงิน (USD หรือ THB)
 * @param locale - ภาษา (en หรือ th)
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56, "USD", "en") // "$1,234.56"
 * formatCurrency(1234.56, "THB", "th") // "฿1,234.56"
 */
export function formatCurrency(
  amount: string | number,
  currency: "USD" | "THB" = "USD",
  locale: "en" | "th" = "en"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  // ใช้ Intl.NumberFormat สำหรับ format ตามภาษาและสกุลเงิน
  const formatter = new Intl.NumberFormat(locale === "en" ? "en-US" : "th-TH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,    // ทศนิยมอย่างน้อย 2 ตำแหน่ง
    maximumFractionDigits: 6,    // ทศนิยมสูงสุด 6 ตำแหน่ง (สำหรับ crypto)
  });
  
  return formatter.format(num);
}

/**
 * Format เปอร์เซ็นต์
 * 
 * @param value - ค่าเปอร์เซ็นต์
 * @param decimals - จำนวนทศนิยม (default: 2)
 * @returns Formatted percentage string
 * 
 * @example
 * formatPercentage(12.3456) // "12.35%"
 * formatPercentage(5.1, 1) // "5.1%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 2
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format จำนวน token (จัดการ decimals)
 * 
 * @param amount - จำนวน token (raw amount)
 * @param decimals - จำนวน decimals ของ token (default: 18)
 * @param displayDecimals - จำนวนทศนิยมที่แสดง (default: 4)
 * @returns Formatted token amount
 * 
 * @example
 * formatTokenAmount("1000000000000000000", 18, 2) // "1.00" (1 ETH)
 * formatTokenAmount("500000", 6, 2) // "0.50" (0.5 USDC)
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const adjusted = num / Math.pow(10, decimals);  // แปลงจาก wei เป็น token units
  
  // ถ้าจำนวนน้อยมาก ให้แสดงเป็น scientific notation
  if (adjusted < 0.0001) {
    return adjusted.toExponential(2);
  }
  
  return adjusted.toFixed(displayDecimals);
}

/**
 * Format Ethereum address แบบย่อ
 * 
 * @param address - Ethereum address
 * @param chars - จำนวนตัวอักษรที่แสดงแต่ละด้าน (default: 4)
 * @returns Shortened address
 * 
 * @example
 * formatAddress("0x1234567890123456789012345678901234567890") // "0x1234...7890"
 * formatAddress("0x1234567890123456789012345678901234567890", 6) // "0x123456...567890"
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format เวลาแบบ relative (เช่น "5m ago", "2h ago")
 * 
 * @param date - วันที่ที่ต้องการ format
 * @returns Relative time string
 * 
 * @example
 * formatTimeAgo(new Date(Date.now() - 300000)) // "5m ago"
 * formatTimeAgo(new Date(Date.now() - 7200000)) // "2h ago"
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // น้อยกว่า 1 นาที
  if (diffInSeconds < 60) return "just now";
  // น้อยกว่า 1 ชั่วโมง
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  // น้อยกว่า 1 วัน
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  // น้อยกว่า 1 เดือน
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  // มากกว่า 1 เดือน ให้แสดงวันที่เต็ม
  return date.toLocaleDateString();
}