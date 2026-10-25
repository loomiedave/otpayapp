import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { useTranslation } from 'react-i18next';

import * as lock from '@/lib/appLock';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const LOCK_AFTER_MS = 30_000;

export interface PinResult {
  ok: boolean;
  lockedUntil: number | null;
  attemptsLeft: number;
}

type EnableBiometricResult = 'ok' | 'unavailable' | 'not_enrolled' | 'failed';
type BiometricResult = { success: boolean; error?: string };

interface AppLockContextValue {
  ready: boolean; 
  locked: boolean;
  settings: lock.LockSettings;
  checkPin: (pin: string) => Promise<PinResult>;
  unlockWithPin: (pin: string) => Promise<PinResult>;
  authenticateBiometric: (message: string, allowDeviceFallback: boolean) => Promise<BiometricResult>;
  unlockWithBiometric: () => Promise<boolean>;
  enablePin: (pin: string) => Promise<void>;
  disablePin: () => Promise<void>;
  enableBiometric: () => Promise<EnableBiometricResult>;
  disableBiometric: () => Promise<void>;
  resetAndSignOut: () => Promise<void>;
}

const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { session, isLoading: authLoading, signOut } = useAuth();
  const userId = session?.user?.id ?? null;

  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [covered, setCovered] = useState(false); 
  const [settings, setSettings] = useState<lock.LockSettings>({ pinEnabled: false, biometricEnabled: false });

  const coldStartDone = useRef(false);
  const backgroundedAt = useRef<number | null>(null);
  const settingsRef = useRef(settings);
  const userIdRef = useRef(userId);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    (async () => {
      if (!userId) {
        coldStartDone.current = true;
        setSettings({ pinEnabled: false, biometricEnabled: false });
        setLocked(false);
        setReady(true);
        return;
      }
      let loaded: lock.LockSettings = { pinEnabled: false, biometricEnabled: false };
      try {
        loaded = await lock.loadSettings(userId);
      } catch (e) {
        console.warn('Could not read lock settings', e);
      }
      if (cancelled) return;
      setSettings(loaded);
      if (!coldStartDone.current) setLocked(loaded.pinEnabled || loaded.biometricEnabled);
      coldStartDone.current = true;
      setReady(true);
    })();

    return () => { cancelled = true; };
  }, [authLoading, userId]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const s = settingsRef.current;
      if (!userIdRef.current || !(s.pinEnabled || s.biometricEnabled)) {
        setCovered(false);
        return;
      }
      if (next === 'active') {
        setCovered(false);
        if (backgroundedAt.current !== null) {
          const away = Date.now() - backgroundedAt.current;
          backgroundedAt.current = null;
          if (away >= LOCK_AFTER_MS) setLocked(true);
        }
      } else {
        setCovered(true); // best effort: hides balances in the app switcher
        // only "background" starts the timer ("inactive" also fires for system dialogs)
        if (next === 'background' && backgroundedAt.current === null) backgroundedAt.current = Date.now();
      }
    });
    return () => sub.remove();
  }, []);

  const checkPin = useCallback(async (pin: string): Promise<PinResult> => {
    if (!userId) return { ok: false, lockedUntil: null, attemptsLeft: 0 };
    const state = await lock.getLockout(userId);
    if (state.until > Date.now()) return { ok: false, lockedUntil: state.until, attemptsLeft: 0 };
    if (await lock.verifyPin(userId, pin)) {
      await lock.resetLockout(userId);
      return { ok: true, lockedUntil: null, attemptsLeft: 0 };
    }
    const next = await lock.registerFailure(userId);
    return {
      ok: false,
      lockedUntil: next.until > Date.now() ? next.until : null,
      attemptsLeft: lock.attemptsLeft(next),
    };
  }, [userId]);

  const unlockWithPin = useCallback(async (pin: string) => {
    const result = await checkPin(pin);
    if (result.ok) setLocked(false);
    return result;
  }, [checkPin]);

  const authenticateBiometric = useCallback(async (message: string, allowDeviceFallback: boolean): Promise<BiometricResult> => {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: message,
      cancelLabel: t('common.cancel'),
      disableDeviceFallback: !allowDeviceFallback,
      biometricsSecurityLevel: 'strong',
    });
    if (res.success) return { success: true };
    return { success: false, error: res.error };
  }, [t]);

  const unlockWithBiometric = useCallback(async () => {
    const res = await authenticateBiometric(t('lock.biometric_prompt'), !settingsRef.current.pinEnabled);
    if (res.success) setLocked(false);
    return res.success;
  }, [authenticateBiometric, t]);

  const enablePin = useCallback(async (pin: string) => {
    if (!userId) return;
    await lock.savePin(userId, pin);
    setSettings((s) => ({ ...s, pinEnabled: true }));
  }, [userId]);

  const disablePin = useCallback(async () => {
    if (!userId) return;
    await lock.removePin(userId);
    setSettings((s) => ({ ...s, pinEnabled: false }));
  }, [userId]);

  const enableBiometric = useCallback(async (): Promise<EnableBiometricResult> => {
    if (!userId) return 'failed';
    if (!(await LocalAuthentication.hasHardwareAsync())) return 'unavailable';
    if (!(await LocalAuthentication.isEnrolledAsync())) return 'not_enrolled';
    // Test it once, so the user can't enable something that doesn't work
    const res = await authenticateBiometric(t('security.biometric_prompt_enable'), true);
    if (!res.success) return 'failed';
    await lock.saveBiometric(userId, true);
    setSettings((s) => ({ ...s, biometricEnabled: true }));
    return 'ok';
  }, [userId, authenticateBiometric, t]);

  const disableBiometric = useCallback(async () => {
    if (!userId) return;
    await lock.saveBiometric(userId, false);
    setSettings((s) => ({ ...s, biometricEnabled: false }));
  }, [userId]);

  const resetAndSignOut = useCallback(async () => {
    if (userId) await lock.clearAll(userId);
    setLocked(false);
    await signOut();
  }, [userId, signOut]);

  return (
    <AppLockContext.Provider
      value={{
        ready, locked, settings, checkPin, unlockWithPin, authenticateBiometric, unlockWithBiometric,
        enablePin, disablePin, enableBiometric, disableBiometric, resetAndSignOut,
      }}
    >
      {children}
      {/* Plain cover shown while the app is in the background / app switcher */}
      {covered && !locked ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}
        />
      ) : null}
    </AppLockContext.Provider>
  );
}

export function useAppLock(): AppLockContextValue {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used inside AppLockProvider');
  return ctx;
}