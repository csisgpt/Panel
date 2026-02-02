import type { FileLink } from "@/lib/types/backend";

export interface FileLinksProvider {
  getLink?: (fileId: string, mode: "preview" | "download") => Promise<FileLink | null>;
  getLinks?: (fileIds: string[], mode: "preview" | "download") => Promise<FileLink[]>;
}
