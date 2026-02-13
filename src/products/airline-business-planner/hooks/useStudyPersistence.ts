import { useEffect, useRef, useCallback } from 'react';
import type { PersistedStudyData } from '../pages/types';

const STORAGE_PREFIX = 'abp_study_';

export function getStorageKey(studyId: string | undefined): string {
  return `${STORAGE_PREFIX}${studyId || 'default'}`;
}

export function loadFromStorage(studyId: string | undefined): PersistedStudyData | null {
  try {
    const key = getStorageKey(studyId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as PersistedStudyData;
    }
  } catch (e) {
    console.warn('Failed to load study from localStorage:', e);
  }
  return null;
}

export function saveToStorage(studyId: string | undefined, data: PersistedStudyData): void {
  try {
    const key = getStorageKey(studyId);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save study to localStorage:', e);
  }
}

export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}
