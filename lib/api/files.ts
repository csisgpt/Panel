import { apiGet } from "./client";
import { isMockMode } from "./config";
import { getMockAttachments, getMockFiles } from "@/lib/mock-data";
import { Attachment, FileMeta } from "@/lib/types/backend";

export async function getFiles(): Promise<FileMeta[]> {
  if (isMockMode()) return getMockFiles();
  return apiGet<FileMeta[]>("/files");
}

export async function getAttachments(): Promise<Attachment[]> {
  if (isMockMode()) return getMockAttachments();
  return apiGet<Attachment[]>("/attachments");
}
