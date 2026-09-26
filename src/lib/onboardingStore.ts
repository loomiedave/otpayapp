import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

let hasLaunched: boolean | null = null;
const listeners = new Set<() => void>();

AsyncStorage.getItem('HAS_LAUNCHED')
  .then((value) => {
    hasLaunched = value === 'true';
    listeners.forEach((l) => l());
  })
  .catch(() => {
    hasLaunched = true;
    listeners.forEach((l) => l());
  });

export async function markLaunched() {
  await AsyncStorage.setItem('HAS_LAUNCHED', 'true');
  hasLaunched = true;
  listeners.forEach((l) => l());
}

export function useHasLaunched(): boolean | null {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => hasLaunched
  );
}

// add to onboardingStore.ts
export async function resetLaunched() {
  await AsyncStorage.removeItem('HAS_LAUNCHED');
  hasLaunched = false;
  listeners.forEach((l) => l());
}
