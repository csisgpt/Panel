"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Thumbs } from "swiper/modules";
import { cn } from "@/lib/utils";
import type { AttachmentItem } from "./use-attachment-gallery";
import { AttachmentStrip } from "./attachment-strip";
import "swiper/css";
import "swiper/css/thumbs";

export interface AttachmentGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AttachmentItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
}

export function AttachmentGallery({ items, activeId, onSelect, className, ...props }: AttachmentGalleryProps) {
  const active = items.find((item) => item.id === activeId) ?? items[0];
  const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperClass | null>(null);
  const initialIndex = Math.max(
    0,
    active ? items.findIndex((item) => item.id === active.id) : 0
  );

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="rounded-xl border bg-muted/40">
        <Swiper
          modules={[Thumbs]}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          initialSlide={initialIndex}
          onSlideChange={(swiper) => {
            const item = items[swiper.activeIndex];
            if (item) onSelect?.(item.id);
          }}
          className="h-64"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="flex items-center justify-center">
              <img src={item.url} alt={item.name} className="max-h-full max-w-full object-contain" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <AttachmentStrip
        items={items}
        activeId={active?.id}
        onSelect={onSelect}
        onSwiper={setThumbsSwiper}
      />
    </div>
  );
}
