'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { STORAGE_KEY } from '@/components/FavoriteButton';

type FavoritePayload = {
  slug: string;
  title: string;
};

function readFavorites(): FavoritePayload[] {
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

export function FavoritesPanel() {
  const [favorites, setFavorites] = useState<FavoritePayload[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    window.addEventListener('favorites:updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('favorites:updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <section aria-labelledby="favorites-title">
      <h3 id="favorites-title" style={{ fontSize: '1rem' }}>Favorites</h3>
      {favorites.length === 0 ? (
        <p style={{ marginTop: 0 }}>No saved pages yet.</p>
      ) : (
        <ul className="clean" style={{ marginBottom: '1rem' }}>
          {favorites.map((item) => (
            <li key={item.slug}>
              <Link href={`/content/${item.slug}`}>{item.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
