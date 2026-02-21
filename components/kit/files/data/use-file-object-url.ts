"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGetBlob } from "@/lib/api/client";

export function useFileObjectUrl({
  url,
  enabled,
  cacheKey,
}: {
  url?: string;
  enabled: boolean;
  cacheKey: string;
}) {
  const [objectUrl, setObjectUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [version, setVersion] = useState(0);
  const objectUrlRef = useRef<string>();

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = undefined;
    }
    setObjectUrl(undefined);
  }, []);

  const refetch = useCallback(() => {
    setVersion((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !url) {
      setIsLoading(false);
      setError(undefined);
      clearObjectUrl();
      return;
    }

    setIsLoading(true);
    setError(undefined);

    apiGetBlob(url)
      .then((blob) => {
        if (cancelled) return;
        clearObjectUrl();
        const nextUrl = URL.createObjectURL(blob);
        objectUrlRef.current = nextUrl;
        setObjectUrl(nextUrl);
      })
      .catch(() => {
        if (cancelled) return;
        setError("خطا در دریافت فایل");
        clearObjectUrl();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, enabled, cacheKey, version, clearObjectUrl]);

  useEffect(() => {
    return () => {
      clearObjectUrl();
    };
  }, [clearObjectUrl]);

  return {
    objectUrl,
    isLoading,
    error,
    refetch,
  };
}
