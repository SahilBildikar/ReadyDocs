import { z } from 'zod';

const FORBIDDEN_FIELDS = [
  'aadhaar',
  'pan',
  'bank_account',
  'account_number',
  'otp',
  'password',
  'card_number',
  'cvv',
  'policy_number'
];

export const profileSchema = z.object({
  profile_name: z
    .string({ required_error: 'Profile name is required (e.g. My Profile, Father, Student)' })
    .trim()
    .min(2, { message: 'Profile name must be at least 2 characters long' })
    .max(100, { message: 'Profile name cannot exceed 100 characters' }),
  full_name: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters long' })
    .max(255, { message: 'Full name cannot exceed 255 characters' }),
  date_of_birth: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: 'Date of birth must be in YYYY-MM-DD format' }
    ),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say', ''])
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      { message: 'Please provide a valid email address' }
    ),
  phone: z
    .string()
    .trim()
    .max(50, { message: 'Phone number cannot exceed 50 characters' })
    .optional()
    .nullable(),
  address: z
    .string()
    .trim()
    .max(1000, { message: 'Address cannot exceed 1000 characters' })
    .optional()
    .nullable(),
  city: z
    .string()
    .trim()
    .max(100, { message: 'City cannot exceed 100 characters' })
    .optional()
    .nullable(),
  state: z
    .string()
    .trim()
    .max(100, { message: 'State cannot exceed 100 characters' })
    .optional()
    .nullable(),
  pin_code: z
    .string()
    .trim()
    .max(20, { message: 'Pin code cannot exceed 20 characters' })
    .optional()
    .nullable(),
  education_details: z
    .string()
    .trim()
    .max(1000, { message: 'Education details cannot exceed 1000 characters' })
    .optional()
    .nullable(),
  language: z
    .enum(['english', 'hindi', 'marathi'])
    .optional()
    .default('english'),
  is_active: z.boolean().optional().default(false)
})
.passthrough()
.superRefine((data, ctx) => {
  // Check for zero-knowledge privacy violations
  for (const forbidden of FORBIDDEN_FIELDS) {
    if (forbidden in data) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Field "${forbidden}" is strictly forbidden for security and privacy compliance. ReadyDocs never accepts or stores Aadhaar, PAN, Bank Accounts, OTPs, or passwords.`,
        path: [forbidden]
      });
    }
  }
});
