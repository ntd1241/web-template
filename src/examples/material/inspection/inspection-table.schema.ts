import { z } from 'zod';

export const inspectionTableFormSchema = z.object({
  code: z.string().min(1, 'Bắt buộc'),
  name: z.string().min(1, 'Bắt buộc'),
  description: z.string(),
});

export type InspectionTableFormValues = z.infer<
  typeof inspectionTableFormSchema
>;
