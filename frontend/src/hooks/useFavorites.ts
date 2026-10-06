import { useCallback, useSyncExternalStore } from 'react';

// Favorit disimpan di browser pengunjung (tanpa login)
const KEY = 'skuyy_favorites';
const listeners = new Set<() => void>();

const read = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

let snapshot = read();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, () => snapshot);

  const toggle = useCallback((id: string) => {
    snapshot = snapshot.includes(id) ? snapshot.filter((x) => x !== id) : [...snapshot, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch {
      /* penyimpanan penuh / diblokir */
    }
    listeners.forEach((l) => l());
  }, []);

  return { favorites, isFavorite: (id: string) => favorites.includes(id), toggle };
}
