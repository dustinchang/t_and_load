import { useState, useCallback, useRef } from "react";
import type { GPSPosition } from "../types";

const EARTH_RADIUS_YARDS = 6371000 * 1.09361;

function haversineYards(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_YARDS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const tauriWatchIdRef = useRef<string | null>(null);

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    setPosition({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    });
    setError(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(err.message);
  }, []);

  const getOnce = useCallback(async () => {
    if (isTauri()) {
      try {
        const { getCurrentPosition } =
          await import("@tauri-apps/plugin-geolocation");
        const pos = await getCurrentPosition();
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? 0,
          timestamp: pos.timestamp,
        });
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } else {
      setError("Geolocation not supported");
    }
  }, [handlePosition, handleError]);

  const startWatching = useCallback(async () => {
    if (isWatching) return;
    setIsWatching(true);

    if (isTauri()) {
      try {
        const { watchPosition } =
          await import("@tauri-apps/plugin-geolocation");
        const id = await watchPosition(
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          (pos) => {
            if (pos && "coords" in pos) {
              setPosition({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy ?? 0,
                timestamp: pos.timestamp,
              });
            }
          },
        );
        tauriWatchIdRef.current = String(id);
      } catch (e) {
        setError((e as Error).message);
        setIsWatching(false);
      }
    } else if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        { enableHighAccuracy: true },
      );
    } else {
      setError("Geolocation not supported");
      setIsWatching(false);
    }
  }, [isWatching, handlePosition, handleError]);

  const stopWatching = useCallback(async () => {
    if (!isWatching) return;

    if (isTauri() && tauriWatchIdRef.current) {
      try {
        const { clearWatch } = await import("@tauri-apps/plugin-geolocation");
        await clearWatch(Number(tauriWatchIdRef.current));
      } catch {
        /* ignore */
      }
      tauriWatchIdRef.current = null;
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsWatching(false);
  }, [isWatching]);

  const distanceTo = useCallback(
    (lat: number, lng: number): number | null => {
      if (!position) return null;
      return haversineYards(position.latitude, position.longitude, lat, lng);
    },
    [position],
  );

  return {
    position,
    error,
    isWatching,
    getOnce,
    startWatching,
    stopWatching,
    distanceTo,
  };
}
