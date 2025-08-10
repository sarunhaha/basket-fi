import { z } from "zod";

export const TokenSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  logoUri: z.string().optional(),
  price: z.string().optional(),
  priceChange24h: z.number().optional(),
  marketCap: z.string().optional(),
  volume24h: z.string().optional(),
});

export const TokenPriceHistorySchema = z.object({
  tokenAddress: z.string(),
  timestamp: z.date(),
  price: z.string(),
  volume: z.string().optional(),
});

export const TokenSearchResultSchema = z.object({
  tokens: z.array(TokenSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type Token = z.infer<typeof TokenSchema>;
export type TokenPriceHistory = z.infer<typeof TokenPriceHistorySchema>;
export type TokenSearchResult = z.infer<typeof TokenSearchResultSchema>;