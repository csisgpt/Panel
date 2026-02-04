"use client";

import { useState } from "react";

export interface AttachmentItem {
  id: string;
  name: string;
  url: string;
}

export function useAttachmentGallery(items: AttachmentItem[]) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return {
    activeId,
    setActiveId,
    activeItem,
  };
}
