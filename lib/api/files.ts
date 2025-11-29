import { apiGet } from "./client";
import { isMockMode } from "./config";
import { getMockAttachments, getMockFiles } from "@/lib/mock-data";
import { Attachment, AttachmentEntityType, FileMeta } from "@/lib/types/backend";

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
