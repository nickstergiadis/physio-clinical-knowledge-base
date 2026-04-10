'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'clinical-kb-favorites';

type FavoritePayload = {
  href: string;
  title: string;
};

function readFavorites(): FavoritePayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item?.href === 'string' && typeof item?.title === 'string') {
        return [{ href: item.href, title: item.title }];
      }

      if (typeof item?.slug === 'string' && typeof item?.title === 'string') {
        return [{ href: `/content/${item.slug}`, title: item.title }];
      }

      return [];
    });
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoritePayload[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('favorites:updated'));
}

export function FavoriteButton({ href, title }: FavoritePayload) {
  const [favorites, setFavorites] = useState<FavoritePayload[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    window.addEventListener('favorites:updated', sync);
    return () => window.removeEventListener('favorites:updated', sync);
  }, []);

  const isFavorite = useMemo(() => favorites.some((item) => item.href === href), [favorites, href]);

  const toggleFavorite = () => {
    const next = isFavorite
      ? favorites.filter((item) => item.href !== href)
      : [{ href, title }, ...favorites].slice(0, 30);
    setFavorites(next);
    writeFavorites(next);
  };

  return (
    <button
      type="button"
      className="favorite-btn"
      onClick={toggleFavorite}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remove ${title} from favorites` : `Save ${title} to favorites`}
    >
      {isFavorite ? '★ Saved' : '☆ Save'}
    </button>
  );
}

export { STORAGE_KEY };
