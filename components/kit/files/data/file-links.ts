import type { FileLink } from "@/lib/types/backend";

export interface FileLinksProvider {
  getLinks: (fileIds: string[], mode: "preview" | "download") => Promise<FileLink[]>;
}
