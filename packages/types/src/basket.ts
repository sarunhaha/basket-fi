import { z } from "zod";

export const TokenAllocationSchema = z.object({
  tokenAddress: z.string(),
  symbol: z.string(),
  name: z.string(),
  percentage: z.number().min(0).max(100),
  amount: z.string().optional(),
});

export const BasketSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  allocations: z.array(TokenAllocationSchema),
  totalValue: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  isPublic: z.boolean().default(false),
});

export const CreateBasketSchema = BasketSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const UpdateBasketSchema = CreateBasketSchema.partial();

export const RebalanceRecommendationSchema = z.object({
  basketId: z.string(),
  currentAllocations: z.array(TokenAllocationSchema),
  targetAllocations: z.array(TokenAllocationSchema),
  trades: z.array(z.object({
    from: z.string(),
    to: z.string(),
    amount: z.string(),
    estimatedGas: z.string().optional(),
  })),
  estimatedCost: z.string(),
});

export type TokenAllocation = z.infer<typeof TokenAllocationSchema>;
export type Basket = z.infer<typeof BasketSchema>;
export type CreateBasket = z.infer<typeof CreateBasketSchema>;
export type UpdateBasket = z.infer<typeof UpdateBasketSchema>;
export type RebalanceRecommendation = z.infer<typeof RebalanceRecommendationSchema>;