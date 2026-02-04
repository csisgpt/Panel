"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { cn } from "@/lib/utils";
import type { AttachmentItem } from "./use-attachment-gallery";
import "swiper/css";

export interface AttachmentStripProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AttachmentItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onSwiper?: (swiper: SwiperClass) => void;
}

export function AttachmentStrip({ items, activeId, onSelect, onSwiper, className, ...props }: AttachmentStripProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <Swiper
        slidesPerView="auto"
        spaceBetween={8}
        watchSlidesProgress
        onSwiper={onSwiper}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="!w-16">
            <button
              type="button"
              onClick={() => onSelect?.(item.id)}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-xs",
                activeId === item.id ? "border-primary" : "border-border"
              )}
            >
              {item.name}
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
