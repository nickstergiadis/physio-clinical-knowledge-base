'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FavoritesPanel } from '@/components/FavoritesPanel';

type SidebarProps = {
  regions: { slug: string; name: string; count: number }[];
  sections: { slug: string; name: string; count: number }[];
};

export function Sidebar({ regions, sections }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-nav-toggle no-print"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="sidebar-nav"
      >
        {open ? 'Hide navigation' : 'Show navigation'}
      </button>

      <aside id="sidebar-nav" className={`sidebar ${open ? 'open' : ''}`} aria-label="Site navigation">
        <nav onClick={() => setOpen(false)}>
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Clinical KB</h2>
          <ul className="clean" style={{ marginBottom: '1rem' }}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/search">Search</Link></li>
          </ul>

          <FavoritesPanel />

          <h3 style={{ fontSize: '1rem' }}>Body Region</h3>
          <ul className="clean" style={{ marginBottom: '1rem' }}>
            {regions.map((r) => (
              <li key={r.slug}>
                <Link href={`/search?region=${encodeURIComponent(r.slug)}`}>{r.name} ({r.count})</Link>
              </li>
            ))}
          </ul>

          <h3 style={{ fontSize: '1rem' }}>Content Sections</h3>
          <ul className="clean">
            {sections.map((section) => (
              <li key={section.slug}>
                <Link href={`/search?section=${encodeURIComponent(section.slug)}`}>{section.name} ({section.count})</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
