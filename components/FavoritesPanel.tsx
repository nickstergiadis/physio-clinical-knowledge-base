'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { STORAGE_KEY } from '@/components/FavoriteButton';

type FavoritePayload = {
  href: string;
  title: string;
};

function readFavorites(): FavoritePayload[] {
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
            <li key={item.href}>
              <Link href={item.href as Route}>{item.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
