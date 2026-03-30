'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'clinical-kb-favorites';

type FavoritePayload = {
  slug: string;
  title: string;
};

function readFavorites(): FavoritePayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item?.slug === 'string' && typeof item?.title === 'string');
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoritePayload[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('favorites:updated'));
}

export function FavoriteButton({ slug, title }: FavoritePayload) {
  const [favorites, setFavorites] = useState<FavoritePayload[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    window.addEventListener('favorites:updated', sync);
    return () => window.removeEventListener('favorites:updated', sync);
  }, []);

  const isFavorite = useMemo(() => favorites.some((item) => item.slug === slug), [favorites, slug]);

  const toggleFavorite = () => {
    const next = isFavorite
      ? favorites.filter((item) => item.slug !== slug)
      : [{ slug, title }, ...favorites].slice(0, 30);
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
