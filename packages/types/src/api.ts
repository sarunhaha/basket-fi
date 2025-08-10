import { z } from "zod";

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});

export const AlertSchema = z.object({
  id: z.string(),
  userId: z.string(),
  basketId: z.string().optional(),
  tokenAddress: z.string().optional(),
  type: z.enum(["price", "percentage", "rebalance"]),
  condition: z.enum(["above", "below", "change"]),
  value: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateAlertSchema = AlertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type Pagination = z.infer<typeof PaginationSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type CreateAlert = z.infer<typeof CreateAlertSchema>;