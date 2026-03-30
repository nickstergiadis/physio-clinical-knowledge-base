import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';

type ImportStatus = {
  sourceRoot: string;
  generatedAt: string;
  lastImportAt: string | null;
  status: 'imported' | 'skipped' | 'failed';
  fileCount: number;
  changed: boolean;
  summary: {
    missingTitles: string[];
    duplicateSlugs: { slug: string; files: string[] }[];
    missingInference: { sourcePath: string; missing: ('region' | 'type')[] }[];
    brokenRelatedLinks: { sourcePath: string; link: string }[];
    frontmatterConsistency: { sourcePath: string; issue: string }[];
  };
};

const STATUS_PATH = path.resolve('.kb-admin/import-status.json');

export async function getImportStatus(): Promise<ImportStatus | null> {
  try {
    const raw = await fs.readFile(STATUS_PATH, 'utf8');
    return JSON.parse(raw) as ImportStatus;
  } catch {
    return null;
  }
}

export async function getAdminDashboardData() {
  const [types, regions, status] = await Promise.all([
    prisma.contentType.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    }),
    prisma.region.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    }),
    getImportStatus(),
  ]);

  return {
    typeCounts: types.map((type) => ({ name: type.name, count: type._count.items })),
    regionCounts: regions.map((region) => ({ name: region.name, count: region._count.items })),
    status,
  };
}
