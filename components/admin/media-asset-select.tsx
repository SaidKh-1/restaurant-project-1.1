"use client";

import { useCallback, useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminGet } from "@/lib/admin/fetch-client";

type MediaAssetOption = {
  id: string;
  publicUrl: string;
  mimeType: string;
  translations: {
    ar: {
      altText: string | null;
      caption: string | null;
    } | null;
    en: {
      altText: string | null;
      caption: string | null;
    } | null;
  };
};

type MediaAssetSelectProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
};

export function MediaAssetSelect({
  value,
  onChange,
  disabled = false,
  placeholder = "اختر صورة من المكتبة",
  allowClear = true,
}: MediaAssetSelectProps) {
  const [assets, setAssets] = useState<MediaAssetOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  const loadAssets = useCallback(async () => {
    if (hasLoaded || loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    setIsLoading(true);

    const promise = (async () => {
      try {
        const data = await adminGet<MediaAssetOption[]>("/api/admin/media");
        setAssets(data);
        setHasLoaded(true);
      } finally {
        setIsLoading(false);
        loadPromiseRef.current = null;
      }
    })();

    loadPromiseRef.current = promise;
    return promise;
  }, [hasLoaded]);

  function handleOpenChange(open: boolean) {
    if (open) {
      void loadAssets();
    }
  }

  return (
    <Select
      value={value ?? "__none__"}
      onOpenChange={handleOpenChange}
      onValueChange={(nextValue) => {
        onChange(nextValue === "__none__" ? null : nextValue);
      }}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={
            hasLoaded && assets.length === 0
              ? "لا توجد صور في المكتبة بعد"
              : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="p-2">
            <Skeleton className="h-8 w-full" />
          </div>
        ) : null}
        {!isLoading && hasLoaded ? (
          <>
            {allowClear ? (
              <SelectItem value="__none__">بدون صورة</SelectItem>
            ) : null}
            {assets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                <span className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.publicUrl}
                    alt=""
                    className="size-6 rounded object-cover"
                  />
                  <span className="truncate">
                    {asset.translations.ar?.altText ??
                      asset.translations.ar?.caption ??
                      asset.id}
                  </span>
                </span>
              </SelectItem>
            ))}
          </>
        ) : null}
      </SelectContent>
    </Select>
  );
}
