import { useState, useEffect, useCallback, useRef } from 'react';
import { osmApi } from '../services/osmApi';
import type { OSMFeature } from '../types';

const featureCache = new Map<string, OSMFeature[]>();

export function useOSMData(lat: number | null, lng: number | null) {
  const [features, setFeatures] = useState<OSMFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    if (lat === null || lng === null) return;

    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (featureCache.has(key)) {
      setFeatures(featureCache.get(key)!);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const data = await osmApi.fetchGolfFeatures(lat, lng);
      featureCache.set(key, data);
      setFeatures(data);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError((e as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetch();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetch]);

  return { features, isLoading, error, refetch: fetch };
}
