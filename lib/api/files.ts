import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { getMockAttachments, getMockFileLinks, getMockFiles } from "@/lib/mock-data";
import { Attachment, AttachmentEntityType, FileLink, FileMeta } from "@/lib/types/backend";

export async function getFiles(): Promise<FileMeta[]> {
  if (isMockMode()) return getMockFiles();
  return apiGet<FileMeta[]>("/files");
}

export async function getAttachments(
  entityType?: AttachmentEntityType,
  entityId?: string
): Promise<Attachment[]> {
  if (isMockMode()) return getMockAttachments(entityType, entityId);
  const params = new URLSearchParams();
  if (entityType) params.append("entityType", entityType);
  if (entityId) params.append("entityId", entityId);
  const query = params.toString();
  return apiGet<Attachment[]>(`/attachments${query ? `?${query}` : ""}`);
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
