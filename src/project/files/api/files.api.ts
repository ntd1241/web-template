import {
  getPublicStorageUrl,
  removeStorageObjects,
  TENANT_ASSETS_BUCKET,
  uploadStorageObject,
} from '@/lib/storage';
import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import type { FileAttachment, FileSubjectType } from '../model/file';

interface FileRow {
  id: string;
  tenant_id: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number | string;
  uploaded_by: string | null;
  created_at: string;
}

interface FileLinkRow {
  id: string;
  tenant_id: string;
  file_id: string;
  subject_type: FileSubjectType;
  subject_id: string;
  relation_type: string;
  created_by: string | null;
  created_at: string;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

function numberValue(value: number | string | null | undefined) {
  return value == null ? 0 : typeof value === 'number' ? value : Number(value);
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function fileRowsById(rows: FileRow[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function mapFileAttachment(
  link: FileLinkRow,
  file: FileRow,
  uploadedByNameByUserId?: Map<string, string>,
): FileAttachment {
  return {
    id: link.id,
    fileId: file.id,
    tenantId: link.tenant_id,
    subjectType: link.subject_type,
    subjectId: link.subject_id,
    relationType: link.relation_type,
    fileName: file.file_name,
    mimeType: file.mime_type,
    sizeBytes: numberValue(file.size_bytes),
    storageBucket: file.storage_bucket,
    storagePath: file.storage_path,
    url: getPublicStorageUrl(file.storage_bucket, file.storage_path),
    uploadedBy: file.uploaded_by,
    uploadedByName: file.uploaded_by
      ? (uploadedByNameByUserId?.get(file.uploaded_by) ?? null)
      : null,
    createdBy: link.created_by,
    createdAt: link.created_at,
  };
}

export async function listFilesForSubject(
  tenantId: string,
  subjectType: FileSubjectType,
  subjectId: string,
  uploadedByNameByUserId?: Map<string, string>,
): Promise<FileAttachment[]> {
  assertSupabaseConfigured();
  const links = await request<FileLinkRow[]>(
    supabaseApi.get(
      '/file_links',
      queryParams({
        select:
          'id,tenant_id,file_id,subject_type,subject_id,relation_type,created_by,created_at',
        tenant_id: `eq.${tenantId}`,
        subject_type: `eq.${subjectType}`,
        subject_id: `eq.${subjectId}`,
        order: 'sort_order.asc,created_at.desc',
      }),
    ),
  );
  if (links.length === 0) return [];

  const fileIds = Array.from(new Set(links.map((link) => link.file_id)));
  const files = await request<FileRow[]>(
    supabaseApi.get(
      '/files',
      queryParams({
        select:
          'id,tenant_id,storage_bucket,storage_path,file_name,mime_type,size_bytes,uploaded_by,created_at',
        tenant_id: `eq.${tenantId}`,
        id: `in.(${fileIds.join(',')})`,
        status: 'eq.active',
      }),
    ),
  );
  const filesById = fileRowsById(files);

  return links.flatMap((link) => {
    const file = filesById.get(link.file_id);
    return file ? [mapFileAttachment(link, file, uploadedByNameByUserId)] : [];
  });
}

export async function uploadFilesForSubject(
  tenantId: string,
  subjectType: FileSubjectType,
  subjectId: string,
  userId: string,
  files: File[],
) {
  assertSupabaseConfigured();
  if (files.length === 0) return;

  const uploadedPaths: string[] = [];
  const fileIds: string[] = [];
  const linkIds: string[] = [];
  const fileRows: Array<Record<string, string | number>> = [];
  const linkRows: Array<Record<string, string | number>> = [];

  try {
    for (const file of files) {
      const fileId = crypto.randomUUID();
      const linkId = crypto.randomUUID();
      const storagePath = `${tenantId}/files/${fileId}/${safeFileName(file.name)}`;

      await uploadStorageObject({
        bucket: TENANT_ASSETS_BUCKET,
        path: storagePath,
        file,
      });
      uploadedPaths.push(storagePath);
      fileIds.push(fileId);
      linkIds.push(linkId);

      fileRows.push({
        id: fileId,
        tenant_id: tenantId,
        storage_bucket: TENANT_ASSETS_BUCKET,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        uploaded_by: userId,
      });
      linkRows.push({
        id: linkId,
        tenant_id: tenantId,
        file_id: fileId,
        subject_type: subjectType,
        subject_id: subjectId,
        relation_type: 'attachment',
        created_by: userId,
      });
    }

    await request(
      supabaseApi.post('/files', fileRows, {
        headers: { Prefer: 'return=minimal' },
      }),
    );
    await request(
      supabaseApi.post('/file_links', linkRows, {
        headers: { Prefer: 'return=minimal' },
      }),
    );
  } catch (error) {
    await supabaseApi
      .delete(
        '/file_links',
        queryParams({
          tenant_id: `eq.${tenantId}`,
          id: `in.(${linkIds.join(',')})`,
        }),
      )
      .catch(() => undefined);
    await supabaseApi
      .delete(
        '/files',
        queryParams({
          tenant_id: `eq.${tenantId}`,
          id: `in.(${fileIds.join(',')})`,
        }),
      )
      .catch(() => undefined);
    await removeStorageObjects(TENANT_ASSETS_BUCKET, uploadedPaths).catch(
      () => undefined,
    );
    throw error;
  }
}

export async function deleteFileLink(
  tenantId: string,
  linkId: string,
  subjectType?: FileSubjectType,
  subjectId?: string,
) {
  assertSupabaseConfigured();
  const links = await request<FileLinkRow[]>(
    supabaseApi.get(
      '/file_links',
      queryParams({
        select: 'id,file_id',
        tenant_id: `eq.${tenantId}`,
        id: `eq.${linkId}`,
        ...(subjectType ? { subject_type: `eq.${subjectType}` } : {}),
        ...(subjectId ? { subject_id: `eq.${subjectId}` } : {}),
        limit: '1',
      }),
    ),
  );
  const link = links[0];
  if (!link) throw new Error('Không tìm thấy liên kết tài liệu.');

  const files = await request<FileRow[]>(
    supabaseApi.get(
      '/files',
      queryParams({
        select: 'id,storage_bucket,storage_path',
        tenant_id: `eq.${tenantId}`,
        id: `eq.${link.file_id}`,
        limit: '1',
      }),
    ),
  );

  await request(
    supabaseApi.delete(
      '/file_links',
      queryParams({
        tenant_id: `eq.${tenantId}`,
        id: `eq.${linkId}`,
      }),
    ),
  );

  const remainingLinks = await request<FileLinkRow[]>(
    supabaseApi.get(
      '/file_links',
      queryParams({
        select: 'id',
        tenant_id: `eq.${tenantId}`,
        file_id: `eq.${link.file_id}`,
        limit: '1',
      }),
    ),
  );
  if (remainingLinks.length > 0) return;

  await request(
    supabaseApi.delete(
      '/files',
      queryParams({
        tenant_id: `eq.${tenantId}`,
        id: `eq.${link.file_id}`,
      }),
    ),
  );
  if (files.length > 0) {
    await removeStorageObjects(
      files[0].storage_bucket,
      files.map((file) => file.storage_path),
    );
  }
}

export async function syncFilesForSubject(
  tenantId: string,
  subjectType: FileSubjectType,
  subjectId: string,
  userId: string,
  linkIdsToKeep: string[],
  files: File[],
) {
  assertSupabaseConfigured();
  const existingLinks = await request<FileLinkRow[]>(
    supabaseApi.get(
      '/file_links',
      queryParams({
        select: 'id',
        tenant_id: `eq.${tenantId}`,
        subject_type: `eq.${subjectType}`,
        subject_id: `eq.${subjectId}`,
      }),
    ),
  );
  const keepIds = new Set(linkIdsToKeep);
  const removedLinks = existingLinks.filter((link) => !keepIds.has(link.id));

  await uploadFilesForSubject(tenantId, subjectType, subjectId, userId, files);
  await Promise.all(
    removedLinks.map((link) =>
      deleteFileLink(tenantId, link.id, subjectType, subjectId),
    ),
  );
}
