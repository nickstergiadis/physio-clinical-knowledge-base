import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getNavigationData() {
  const [regions, types] = await Promise.all([
    prisma.region.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { items: true } } } }),
    prisma.contentType.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { items: true } } } }),
  ]);

  return {
    regions: regions.map((r) => ({ slug: r.slug, name: r.name, count: r._count.items })),
    types: types.map((t) => ({ slug: t.slug, name: t.name, count: t._count.items })),
  };
}

export async function getRecentContent(limit = 12) {
  return prisma.contentItem.findMany({
    orderBy: [{ updatedAtSource: 'desc' }, { updatedAt: 'desc' }],
    take: limit,
    include: { region: true, contentType: true },
  });
}

export async function searchContent(params: { q?: string; region?: string; type?: string; take?: number }) {
  const take = params.take ?? 100;

  // PostgreSQL full-text search for title + markdown + tags.
  if (params.q && params.q.trim().length > 0) {
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT DISTINCT ci.id
      FROM "ContentItem" ci
      LEFT JOIN "ContentItemTag" cit ON ci.id = cit."contentItemId"
      LEFT JOIN "Tag" t ON cit."tagId" = t.id
      LEFT JOIN "Region" r ON ci."regionId" = r.id
      LEFT JOIN "ContentType" ct ON ci."contentTypeId" = ct.id
      WHERE to_tsvector('english',
        coalesce(ci.title, '') || ' ' ||
        coalesce(ci.markdown, '') || ' ' ||
        coalesce(string_agg(t.name, ' '), '')
      ) @@ plainto_tsquery('english', ${params.q})
      ${params.region ? Prisma.sql`AND r.slug = ${params.region}` : Prisma.sql``}
      ${params.type ? Prisma.sql`AND ct.slug = ${params.type}` : Prisma.sql``}
      GROUP BY ci.id
      LIMIT ${take}
    `;

    const ids = rows.map((r) => r.id);
    if (!ids.length) return [];

    const items = await prisma.contentItem.findMany({
      where: { id: { in: ids } },
      include: { region: true, contentType: true, tags: { include: { tag: true } } },
    });

    const rank = new Map(ids.map((id, idx) => [id, idx]));
    return items.sort((a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999));
  }

  const where: Prisma.ContentItemWhereInput = {
    AND: [params.region ? { region: { slug: params.region } } : {}, params.type ? { contentType: { slug: params.type } } : {}],
  };

  return prisma.contentItem.findMany({
    where,
    orderBy: [{ updatedAtSource: 'desc' }, { title: 'asc' }],
    include: { region: true, contentType: true, tags: { include: { tag: true } } },
    take,
  });
}

export async function getContentBySlug(slug: string) {
  return prisma.contentItem.findUnique({
    where: { slug },
    include: {
      region: true,
      contentType: true,
      citations: true,
      tags: { include: { tag: true } },
      outboundLinks: { include: { targetItem: { include: { contentType: true, region: true } } }, take: 25 },
    },
  });
}

export async function getRelatedByRegionAndType(slug: string, regionId?: string | null, contentTypeId?: string | null) {
  return prisma.contentItem.findMany({
    where: {
      NOT: { slug },
      OR: [regionId ? { regionId } : undefined, contentTypeId ? { contentTypeId } : undefined].filter(
        Boolean,
      ) as Prisma.ContentItemWhereInput[],
    },
    include: { region: true, contentType: true },
    take: 8,
    orderBy: { updatedAtSource: 'desc' },
  });
}
