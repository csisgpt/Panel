"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FileLink } from "@/lib/types/backend";
import { getFileLinksBatch } from "@/lib/api/files";
import { queryKeys } from "@/lib/query/query-keys";
import type { FileLinksProvider } from "./file-links";

/**
 * Fetch file links with stable cache keys and optional custom provider.
 */
export function useFileLinks({
  fileIds,
  mode = "preview",
  provider,
}: {
  fileIds: string[];
  mode?: "preview" | "download";
  provider?: FileLinksProvider;
}) {
  const stableIds = useMemo(() => Array.from(new Set(fileIds)).sort(), [fileIds]);
  const enabled = stableIds.length > 0;

  return useQuery<FileLink[]>({
    queryKey: queryKeys.files.linksBatch(stableIds, mode),
    enabled,
    retry: 1,
    queryFn: async () => {
      if (provider?.getLinks) return provider.getLinks(stableIds, mode);
      if (provider?.getLink) {
        const results = await Promise.all(stableIds.map((id) => provider.getLink?.(id, mode)));
        return results.filter(Boolean) as FileLink[];
      }
      return getFileLinksBatch(stableIds, mode);
    },
  });
}
