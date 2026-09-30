import { z } from 'zod';

const FORBIDDEN_PRIVACY_KEYS = [
  'aadhaar', 'pan', 'bank_account', 'account_number', 'otp', 'password',
  'card_number', 'cvv', 'pin', 'policy_number'
];

function checkZeroKnowledge(data, ctx) {
  if (!data || typeof data !== 'object') return;
  const keys = Object.keys(data).map(k => k.toLowerCase());
  for (const forbidden of FORBIDDEN_PRIVACY_KEYS) {
    if (keys.some(k => k.includes(forbidden))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Zero-Knowledge Violation: Field '${forbidden}' is strictly forbidden.`
      });
    }
  }
}

export const generateChecklistSchema = z.object({
  serviceType: z.enum(['sbi_savings', 'sppu_admission', 'insurance_claim'], {
    errorMap: () => ({ message: 'Service type must be sbi_savings, sppu_admission, or insurance_claim' })
  }),
  profileId: z.string().uuid('Valid Profile ID is required'),
  answers: z.record(z.any()).default({})
}).passthrough().superRefine(checkZeroKnowledge);

export const saveChecklistSchema = z.object({
  serviceType: z.enum(['sbi_savings', 'sppu_admission', 'insurance_claim']),
  profileId: z.string().uuid('Valid Profile ID is required'),
  institutionName: z.string().min(1, 'Institution name is required'),
  sourceUrl: z.string().url().optional().nullable(),
  answers: z.record(z.any()).default({}),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    mandatory: z.boolean(),
    acceptedTypes: z.array(z.string()),
    acceptableDocuments: z.array(z.string()),
    explanation: z.string(),
    helpGuideId: z.string().optional().nullable(),
    section: z.string().optional()
  })).min(1, 'Checklist must contain at least one item')
}).passthrough().superRefine(checkZeroKnowledge);

export const updateItemStatusSchema = z.object({
  status: z.enum(['missing', 'application_in_progress', 'ready_to_upload', 'not_applicable'], {
    errorMap: () => ({ message: 'Status must be one of: missing, application_in_progress, ready_to_upload, not_applicable' })
  }),
  notes: z.string().max(255).optional().nullable()
}).passthrough().superRefine(checkZeroKnowledge);
