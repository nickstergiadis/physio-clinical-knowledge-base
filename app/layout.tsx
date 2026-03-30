import type { Metadata } from 'next';
import './globals.css';
import { getNavigationData } from '@/lib/data';
import { Sidebar } from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Clinical Knowledge Base',
  description: 'Accessible, searchable clinical physiotherapy knowledge base',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = await getNavigationData();

  return (
    <html lang="en">
      <body>
        <div className="shell">
          <Sidebar regions={nav.regions} types={nav.types} />
          <main className="main" id="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
