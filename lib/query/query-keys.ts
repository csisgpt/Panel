export const queryKeys = {
  files: {
    links: (fileId: string) => ["files", "links", fileId] as const,
    linksBatch: (fileIds: string[]) => ["files", "links", "batch", ...fileIds] as const,
  },
  p2p: {
    withdrawals: {
      list: (params: Record<string, unknown>) => ["p2p", "withdrawals", params] as const,
    },
    deposits: {
      list: (params: Record<string, unknown>) => ["p2p", "deposits", params] as const,
    },
  },
};
