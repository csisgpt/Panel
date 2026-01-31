import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import {
  getMockAttachments,
  getMockAttachmentsEnvelope,
  getMockFileLinks,
  getMockFiles,
  getMockFilesEnvelope,
} from "@/lib/mock-data";
import { Attachment, AttachmentEntityType, FileLink, FileMeta } from "@/lib/types/backend";
import { normalizeListResponse, type ListEnvelope, type ListMeta } from "@/lib/contracts/list";

export interface FilesListParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface AttachmentsListParams {
  entityType?: AttachmentEntityType;
  entityId?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function listFiles(
  params: FilesListParams = {}
): Promise<{ items: FileMeta[]; meta: ListMeta }> {
  if (isMockMode()) {
    return normalizeListResponse(getMockFilesEnvelope(params));
  }
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  const query = search.toString();
  const response = await apiGet<ListEnvelope<FileMeta>>(`/files${query ? `?${query}` : ""}`);
  return normalizeListResponse(response);
}

export async function getFiles(): Promise<FileMeta[]> {
  if (isMockMode()) return getMockFiles();
  const { items } = await listFiles();
  return items;
}

export async function listAttachments(
  params: AttachmentsListParams = {}
): Promise<{ items: Attachment[]; meta: ListMeta }> {
  if (isMockMode()) {
    return normalizeListResponse(getMockAttachmentsEnvelope(params));
  }
  const search = new URLSearchParams();
  if (params.entityType) search.set("entityType", params.entityType);
  if (params.entityId) search.set("entityId", params.entityId);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  const query = search.toString();
  const response = await apiGet<ListEnvelope<Attachment>>(`/attachments${query ? `?${query}` : ""}`);
  return normalizeListResponse(response);
}

export async function getAttachments(
  entityType?: AttachmentEntityType,
  entityId?: string
): Promise<Attachment[]> {
  if (isMockMode()) return getMockAttachments(entityType, entityId);
  const { items } = await listAttachments({ entityType, entityId });
  return items;
}

export async function getFileLinksBatch(
  fileIds: string[],
  mode: "preview" | "download" = "preview"
): Promise<FileLink[]> {
  if (isMockMode()) return getMockFileLinks(fileIds, mode);
  const response = await apiPost<{ data: FileLink[] }, { fileIds: string[]; mode: string }>(
    "/files/links/batch",
    { fileIds, mode }
  );
  return response.data ?? [];
}

export async function getFileLink(
  fileId: string,
  mode: "preview" | "download" = "preview"
): Promise<FileLink | null> {
  if (isMockMode()) return (await getMockFileLinks([fileId], mode))[0] ?? null;
  return apiGet<FileLink>(`/files/${fileId}?mode=${mode}`);
}
