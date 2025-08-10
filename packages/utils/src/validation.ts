/**
 * @fileoverview Validation Utilities - สำหรับ validate ข้อมูลต่างๆ
 * 
 * ไฟล์นี้รวม functions สำหรับ validate:
 * - Ethereum addresses: ตรวจสอบรูปแบบ address
 * - Percentages: ตรวจสอบค่าเปอร์เซ็นต์
 * - Basket allocations: ตรวจสอบการกระจายใน basket
 * - Input sanitization: ทำความสะอาด user input
 * 
 * ใช้สำหรับ client-side และ server-side validation
 */

/**
 * ตรวจสอบว่า string เป็น Ethereum address ที่ถูกต้องหรือไม่
 * 
 * @param address - String ที่ต้องการตรวจสอบ
 * @returns true ถ้าเป็น address ที่ถูกต้อง
 * 
 * @example
 * isValidAddress("0x1234567890123456789012345678901234567890") // true
 * isValidAddress("0x123") // false
 * isValidAddress("invalid") // false
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);  // 0x + 40 hex characters
}

/**
 * ตรวจสอบว่าค่าเปอร์เซ็นต์อยู่ในช่วงที่ถูกต้อง (0-100)
 * 
 * @param value - ค่าเปอร์เซ็นต์
 * @returns true ถ้าอยู่ในช่วง 0-100
 * 
 * @example
 * isValidPercentage(50) // true
 * isValidPercentage(101) // false
 * isValidPercentage(-5) // false
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

/**
 * ตรวจสอบการกระจายเปอร์เซ็นต์ใน basket
 * ตรวจสอบว่าเปอร์เซ็นต์รวมเท่ากับ 100% หรือไม่
 * 
 * @param allocations - Array ของ allocations ที่มี percentage
 * @returns Object ที่มี isValid และ totalPercentage
 * 
 * @example
 * validateBasketAllocations([{percentage: 50}, {percentage: 50}]) 
 * // { isValid: true, totalPercentage: 100 }
 * 
 * validateBasketAllocations([{percentage: 60}, {percentage: 30}])
 * // { isValid: false, totalPercentage: 90 }
 */
export function validateBasketAllocations(
  allocations: Array<{ percentage: number }>
): { isValid: boolean; totalPercentage: number } {
  const totalPercentage = allocations.reduce(
    (sum, allocation) => sum + allocation.percentage,
    0
  );
  
  return {
    isValid: Math.abs(totalPercentage - 100) < 0.01, // อนุญาตให้มี rounding error เล็กน้อย
    totalPercentage,
  };
}

/**
 * ทำความสะอาด user input เพื่อป้องกัน XSS
 * 
 * @param input - String ที่ต้องการทำความสะอาด
 * @returns Sanitized string
 * 
 * @example
 * sanitizeInput("  <script>alert('xss')</script>  ") // "scriptalert('xss')/script"
 * sanitizeInput("  Hello World  ") // "Hello World"
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");  // ลบ whitespace และ HTML tags
}