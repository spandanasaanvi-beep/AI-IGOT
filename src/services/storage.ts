import { AppState } from '../types';

/* =========================================================================
 * Persistence layer — localStorage today, PostgreSQL-backed API later.
 * All UI state flows through this module so swapping the storage engine
 * (or syncing with the FastAPI backend) touches exactly one file.
 * ======================================================================= */

const STORAGE_KEY = 'pragatiai_state_v1';

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch (e) {
    console.error('[storage] failed to load state', e);
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[storage] failed to save state', e);
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('[storage] failed to clear state', e);
  }
}
