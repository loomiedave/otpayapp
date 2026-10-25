import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export const PIN_LENGTH = 4;
const ATTEMPTS_PER_BLOCK = 5; 
const BASE_LOCKOUT_SECONDS = 30;
const MAX_LOCKOUT_SECONDS = 15 * 60;

export interface LockSettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
}
export interface LockoutState {
  count: number; 
  until: number;
}

const k = (uid: string, name: 'pin' | 'bio' | 'tries') => `applock.${uid}.${name}`;

const WRITE_OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const toHex = (bytes: Uint8Array) => Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');

const hashPin = (pin: string, salt: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);

export async function loadSettings(uid: string): Promise<LockSettings> {
  const [pin, bio] = await Promise.all([
    SecureStore.getItemAsync(k(uid, 'pin')),
    SecureStore.getItemAsync(k(uid, 'bio')),
  ]);
  return { pinEnabled: !!pin, biometricEnabled: bio === '1' };
}

export async function savePin(uid: string, pin: string): Promise<void> {
  const salt = toHex(Crypto.getRandomBytes(16));
  const hash = await hashPin(pin, salt);
  await SecureStore.setItemAsync(k(uid, 'pin'), JSON.stringify({ salt, hash }), WRITE_OPTS);
  await resetLockout(uid);
}

export async function removePin(uid: string): Promise<void> {
  await SecureStore.deleteItemAsync(k(uid, 'pin'));
  await resetLockout(uid);
}

export async function verifyPin(uid: string, pin: string): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(k(uid, 'pin'));
  if (!raw) return false;
  try {
    const { salt, hash } = JSON.parse(raw);
    return (await hashPin(pin, salt)) === hash;
  } catch {
    return false;
  }
}

export async function saveBiometric(uid: string, enabled: boolean): Promise<void> {
  if (enabled) await SecureStore.setItemAsync(k(uid, 'bio'), '1', WRITE_OPTS);
  else await SecureStore.deleteItemAsync(k(uid, 'bio'));
}

export async function getLockout(uid: string): Promise<LockoutState> {
  const raw = await SecureStore.getItemAsync(k(uid, 'tries'));
  if (!raw) return { count: 0, until: 0 };
  try {
    return JSON.parse(raw) as LockoutState;
  } catch {
    return { count: 0, until: 0 };
  }
}

export async function registerFailure(uid: string): Promise<LockoutState> {
  const prev = await getLockout(uid);
  const count = prev.count + 1;
  let until = 0;
  if (count % ATTEMPTS_PER_BLOCK === 0) {
    const block = count / ATTEMPTS_PER_BLOCK;
    const seconds = Math.min(BASE_LOCKOUT_SECONDS * 2 ** (block - 1), MAX_LOCKOUT_SECONDS);
    until = Date.now() + seconds * 1000;
  }
  const next = { count, until };
  await SecureStore.setItemAsync(k(uid, 'tries'), JSON.stringify(next), WRITE_OPTS);
  return next;
}

export const attemptsLeft = (s: LockoutState): number => ATTEMPTS_PER_BLOCK - (s.count % ATTEMPTS_PER_BLOCK);

export async function resetLockout(uid: string): Promise<void> {
  await SecureStore.deleteItemAsync(k(uid, 'tries'));
}

export async function clearAll(uid: string): Promise<void> {
  await Promise.all([removePin(uid), saveBiometric(uid, false)]);
}

export function isTooSimple(pin: string): boolean {
  const d = pin.split('').map(Number);
  const same = d.every((x) => x === d[0]);
  const up = d.every((x, i) => i === 0 || x === d[i - 1] + 1);
  const down = d.every((x, i) => i === 0 || x === d[i - 1] - 1);
  return same || up || down;
}

export const formatSeconds = (s: number): string => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;