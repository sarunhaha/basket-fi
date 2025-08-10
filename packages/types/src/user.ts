import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  preferences: z.object({
    language: z.enum(["en", "th"]).default("en"),
    currency: z.enum(["USD", "THB"]).default("USD"),
    notifications: z.object({
      email: z.boolean().default(false),
      push: z.boolean().default(true),
    }).default({}),
  }).default({}),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;