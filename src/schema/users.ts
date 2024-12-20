import { Role } from "@prisma/client";
import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const AddressSchema = z.object({
  lineOne: z.string(),
  lineTwo: z.string().optional(),
  city: z.string(),
  country: z.string(),
  pincode: z.string().length(6),
});

export const UpdateUserSchema = z.object({
  name: z.string(),
  defaultShippingAddress: z.number().optional(),
  defaultBillingAddress: z.number().optional(),
});

export const ChangeUserRoleSchema = z.object({
  role: z.enum([Role.ADMIN, Role.USER]),
});
