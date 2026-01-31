"use client";

import { useQuery } from "@tanstack/react-query";
import type { FileLink } from "@/lib/types/backend";
import { getFileLinksBatch } from "@/lib/api/files";
import { queryKeys } from "@/lib/query/query-keys";
import type { FileLinksProvider } from "./file-links";

export function useFileLinks({
  fileIds,
  mode = "preview",
  provider,
}: {
  fileIds: string[];
  mode?: "preview" | "download";
  provider?: FileLinksProvider;
}) {
  const enabled = fileIds.length > 0;
  return useQuery<FileLink[]>({
    queryKey: queryKeys.files.linksBatch(fileIds),
    enabled,
    retry: 1,
    queryFn: async () => {
      const ids = Array.from(new Set(fileIds));
      if (provider) return provider.getLinks(ids, mode);
      return getFileLinksBatch(ids, mode);
    },
  });
}
