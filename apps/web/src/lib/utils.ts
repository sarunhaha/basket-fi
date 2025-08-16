/**
 * @fileoverview Web App Utilities - Utility functions สำหรับ Web App
 * 
 * ไฟล์นี้รวม utility functions ที่ใช้เฉพาะใน Web App:
 * - cn: ClassName merging (เหมือนกับใน packages/utils)
 * - formatCurrency: Format เงินตรา
 * - formatPercentage: Format เปอร์เซ็นต์
 * - formatAddress: Format Ethereum addresses
 * - formatDate/formatRelativeTime: Format วันที่และเวลา
 * - debounce/throttle: Performance utilities
 * - copyToClipboard: Copy ข้อความไปยัง clipboard
 * 
 * บางฟังก์ชันอาจซ้ำกับ packages/utils แต่มี customization เพิ่มเติม
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine และ merge CSS classes อย่างชาญฉลาด
 * เหมือนกับใน packages/utils แต่อยู่ใน web app เพื่อความสะดวก
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format จำนวนเงินเป็นรูปแบบสกุลเงิน
 * รองรับ internationalization สำหรับหลายภาษา
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export function formatPercentage(
  value: number | string,
  locale: string = 'en-US'
): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue / 100);
}

export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(
  date: string | Date,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

export function formatRelativeTime(
  date: string | Date,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/**
 * Debounce function - รอให้หยุดเรียกก่อนจะ execute
 * ใช้สำหรับ search input, API calls ที่ไม่ต้องการเรียกบ่อยๆ
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function - จำกัดการเรียกให้ไม่เกิน 1 ครั้งต่อช่วงเวลา
 * ใช้สำหรับ scroll events, resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * ตรวจสอบว่า address เป็น Ethereum address ที่ valid หรือไม่
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * ตรวจสอบว่า address เป็น token address ที่ valid หรือไม่
 * (เหมือน isValidEthereumAddress แต่มีการตรวจสอบเพิ่มเติม)
 */
export function isValidTokenAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const trimmed = address.trim();
  
  // ตรวจสอบ format
  if (!isValidEthereumAddress(trimmed)) {
    return false;
  }

  // ตรวจสอบว่าไม่ใช่ zero address
  if (trimmed.toLowerCase() === '0x0000000000000000000000000000000000000000') {
    return false;
  }

  return true;
}

/**
 * Sanitize token address (remove whitespace, convert to lowercase)
 */
export function sanitizeTokenAddress(address: string): string {
  if (!address) return '';
  return address.trim().toLowerCase();
}

/**
 * Format token amount ตาม decimals ของ token
 * Compatible with ES5 - ใช้ string arithmetic แทน BigInt
 */
export function formatTokenAmount(
  amount: string,
  decimals: number,
  displayDecimals: number = 4
): string {
  try {
    // ใช้ string manipulation แทน BigInt เพื่อ compatibility
    const amountStr = amount.toString();
    
    // ถ้า amount สั้นกว่า decimals ให้ pad ด้วย 0
    const paddedAmount = amountStr.padStart(decimals + 1, '0');
    
    // แยก whole part และ fractional part
    const wholePartEnd = paddedAmount.length - decimals;
    const wholePart = paddedAmount.slice(0, wholePartEnd) || '0';
    const fractionalPart = paddedAmount.slice(wholePartEnd);
    
    // ถ้าไม่มี fractional part หรือเป็น 0 ทั้งหมด
    if (!fractionalPart || fractionalPart.match(/^0+$/)) {
      return wholePart;
    }
    
    // Trim fractional part ตาม displayDecimals และเอา trailing zeros ออก
    const trimmedFractional = fractionalPart
      .slice(0, displayDecimals)
      .replace(/0+$/, '');
    
    if (trimmedFractional === '') {
      return wholePart;
    }
    
    return `${wholePart}.${trimmedFractional}`;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
}

/**
 * Parse token amount string เป็น string representation ตาม decimals
 * Compatible with ES5 - return string แทน BigInt
 */
export function parseTokenAmount(amount: string, decimals: number): string {
  try {
    const [wholePart, fractionalPart = ''] = amount.split('.');
    const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
    const fullAmount = wholePart + paddedFractional;
    
    // Remove leading zeros แต่เก็บอย่างน้อย 1 digit
    return fullAmount.replace(/^0+/, '') || '0';
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return '0';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Copy ข้อความไปยัง clipboard
 * รองรับ modern browsers และ fallback สำหรับ browsers เก่า
 */
export function copyToClipboard(text: string): Promise<void> {
  // ใช้ modern Clipboard API ถ้าใช้ได้
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback สำหรับ browsers เก่า
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject(new Error('Copy to clipboard failed'));
      }
      document.body.removeChild(textArea);
    });
  }
}