export const queryKeys = {
  files: {
    links: (fileId: string, mode: "preview" | "download" = "preview") =>
      ["files", "links", mode, fileId] as const,
    linksBatch: (fileIds: string[], mode: "preview" | "download" = "preview") =>
      ["files", "links", "batch", mode, ...fileIds] as const,
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
