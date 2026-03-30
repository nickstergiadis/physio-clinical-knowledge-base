import type { Metadata } from 'next';
import './globals.css';
import { getNavigationData } from '@/lib/kb';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Clinical Knowledge Base',
  description: 'Static, searchable clinical physiotherapy knowledge base',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = getNavigationData();

  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <div className="shell">
          <Sidebar regions={nav.regions} sections={nav.sections} />
          <main className="main" id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
