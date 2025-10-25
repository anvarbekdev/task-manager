import * as z from 'zod';

export const loginSchema = z.object({
  login: z.string({ message: 'Login is required' }).min(4, "Minimum 4 characters"),
  password: z.string({ message: 'Password is required' }).min(4, "Minimum 4 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

