import { z } from 'zod'

export const userNameSchema = z.object({
  firstName: z.string().trim().min(3, 'Use at least 3 characters').max(25, 'Use 25 characters or fewer'),
  lastName: z.string().trim().max(25, 'Use 25 characters or fewer').optional(),
})
