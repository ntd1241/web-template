export const FILE_SUBJECT_TYPES = {
  contract: 'contract',
} as const;

export type FileSubjectType =
  (typeof FILE_SUBJECT_TYPES)[keyof typeof FILE_SUBJECT_TYPES];

export interface FileAttachment {
  /** The file_links id used to detach this file from a subject. */
  id: string;
  fileId: string;
  tenantId: string;
  subjectType: FileSubjectType;
  subjectId: string;
  relationType: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageBucket: string;
  storagePath: string;
  url: string;
  uploadedBy: string | null;
  uploadedByName: string | null;
  createdBy: string | null;
  createdAt: string;
}
