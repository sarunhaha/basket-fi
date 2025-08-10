/**
 * @fileoverview Button Component - ปุ่มหลักของ Basket.fi
 * 
 * Component นี้เป็นปุ่มที่ใช้ทั่วทั้งแอป รองรับ:
 * - หลายรูปแบบ (variants): default, destructive, outline, secondary, ghost, link
 * - หลายขนาด (sizes): default, sm, lg, icon
 * - Accessibility features จาก Radix UI
 * - Consistent styling ด้วย Tailwind CSS
 * 
 * ใช้ CVA (Class Variance Authority) สำหรับจัดการ variants
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";           // สำหรับ asChild pattern
import { cva, type VariantProps } from "class-variance-authority";  // สำหรับ variant management
import { cn } from "@basket-fi/utils";                 // Utility สำหรับ merge classNames

/**
 * Button Variants Configuration
 * กำหนดรูปแบบและขนาดของปุ่มต่างๆ
 */
const buttonVariants = cva(
  // Base styles - ใช้กับปุ่มทุกแบบ
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary button - ใช้สำหรับ action หลัก
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // Destructive button - ใช้สำหรับการลบหรือ action อันตราย
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Outline button - ใช้สำหรับ secondary actions
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        // Secondary button - ใช้สำหรับ actions รอง
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Ghost button - ใช้สำหรับ subtle actions
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Link button - ใช้เป็นลิงก์
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",     // ขนาดมาตรฐาน
        sm: "h-9 rounded-md px-3",     // ขนาดเล็ก
        lg: "h-11 rounded-md px-8",    // ขนาดใหญ่
        icon: "h-10 w-10",             // สำหรับปุ่มที่มีแค่ icon
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Button Props Interface
 * รวม HTML button attributes กับ variant props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;  // ใช้เมื่อต้องการ render เป็น element อื่น (เช่น Link)
}

/**
 * Button Component
 * ปุ่มหลักที่ใช้ทั่วทั้งแอป
 * 
 * @example
 * <Button variant="default" size="lg">Click me</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // ใช้ Slot ถ้า asChild = true, ไม่งั้นใช้ button element
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };