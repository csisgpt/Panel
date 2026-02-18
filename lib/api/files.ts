import { apiGet, apiPost, apiPostForm } from "./client";
import { isMockMode } from "./config";
import {
  getMockAttachments,
  getMockAttachmentsEnvelope,
  getMockFileLinks,
  getMockFiles,
  getMockFilesEnvelope,
  uploadMockFile,
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

export interface FileDownloadLinkDto {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  label?: string | null;
  method: "presigned" | "raw";
  previewUrl?: string;
  downloadUrl?: string;
  url?: string;
  expiresInSeconds?: number;
}

function mapFileDownloadToLink(input: FileDownloadLinkDto): FileLink {
  return {
    id: input.id,
    previewUrl: input.previewUrl ?? input.url,
    downloadUrl: input.downloadUrl ?? input.url,
    expiresInSeconds: input.expiresInSeconds ?? 0,
  };
}

export async function getFileLinksBatch(
  fileIds: string[],
  mode: "preview" | "download" = "preview"
): Promise<FileLink[]> {
  if (isMockMode()) return getMockFileLinks(fileIds, mode);
  const responses = await Promise.all(fileIds.map((fileId) => apiGet<FileDownloadLinkDto>(`/files/${fileId}`)));
  return responses.map(mapFileDownloadToLink);
}

export async function getFileLink(
  fileId: string,
  mode: "preview" | "download" = "preview"
): Promise<FileLink | null> {
  if (isMockMode()) return (await getMockFileLinks([fileId], mode))[0] ?? null;
  const response = await apiGet<FileDownloadLinkDto>(`/files/${fileId}`);
  return mapFileDownloadToLink(response);
}

export async function uploadFile(file: File, label?: string): Promise<FileMeta> {
  if (isMockMode()) return uploadMockFile(file, label);
  const formData = new FormData();
  formData.append("file", file);
  if (label) {
    formData.append("label", label);
  }
  return apiPostForm<FileMeta>("/files", formData);
}


export async function getFileMetaBatch(fileIds: string[]): Promise<FileMeta[]> {
  if (!fileIds.length) return [];
  if (isMockMode()) {
    const all = await getFiles();
    return all.filter((item) => fileIds.includes(item.id));
  }

  const responses = await Promise.all(fileIds.map((fileId) => apiGet<FileDownloadLinkDto>(`/files/${fileId}`)));
  return responses.map((item) => ({
    id: item.id,
    createdAt: new Date().toISOString(),
    uploadedById: "",
    storageKey: "",
    fileName: item.name,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    label: item.label ?? undefined,
  }));
}
