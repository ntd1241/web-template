import { z } from 'zod';

/** `parentId` = '__root__' nghĩa là nhóm gốc (Select không nhận value rỗng). */
export const ROOT_PARENT_VALUE = '__root__';

export const materialGroupFormSchema = z.object({
  code: z.string().min(1, 'Bắt buộc'),
  name: z.string().min(1, 'Bắt buộc'),
  parentId: z.string(),
  description: z.string(),
  isActive: z.boolean(),
});

export type MaterialGroupFormValues = z.infer<typeof materialGroupFormSchema>;
