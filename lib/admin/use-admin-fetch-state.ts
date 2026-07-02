"use client";

import { useCallback, useRef, useState } from "react";

export function useAdminFetchState() {
  const hasLoadedRef = useRef(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const beginLoad = useCallback(() => {
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
      return;
    }

    setIsInitialLoading(true);
  }, []);

  const endLoad = useCallback((success = true) => {
    if (success) {
      hasLoadedRef.current = true;
    }

    setIsInitialLoading(false);
    setIsRefreshing(false);
  }, []);

  const resetLoaded = useCallback(() => {
    hasLoadedRef.current = false;
    setIsInitialLoading(true);
    setIsRefreshing(false);
  }, []);

  return {
    isInitialLoading,
    isRefreshing,
    beginLoad,
    endLoad,
    resetLoaded,
  };
}
