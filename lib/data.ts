import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const SEARCH_ALIASES: Record<string, string[]> = {
  gtps: ['greater trochanteric pain syndrome', 'lateral hip pain'],
  fais: ['femoroacetabular impingement syndrome', 'hip impingement'],
  oa: ['osteoarthritis', 'degenerative joint disease'],
  aclr: ['anterior cruciate ligament reconstruction', 'acl reconstruction'],
  rcrsp: ['rotator cuff related shoulder pain', 'rotator cuff pain'],
};

function expandQueryAliases(input: string): string {
  const terms = input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const expansions = terms.flatMap((term) => SEARCH_ALIASES[term] ?? []);
  const combined = [input, ...expansions].join(' ').trim();
  return combined.replace(/\s+/g, ' ');
}

function isDiagnosticIntent(input: string): boolean {
  return /\b(dx|diagnos|differential|condition|syndrome|pain|tear|injury|patholog|classification)\b/i.test(input);
}

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

  if (params.q && params.q.trim().length > 0) {
    const originalQuery = params.q.trim();
    const expandedQuery = expandQueryAliases(originalQuery);
    const diagnosticIntent = isDiagnosticIntent(originalQuery);

    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      WITH aggregated AS (
        SELECT
          ci.id,
          ci.title,
          lower(coalesce(ct.slug, '')) AS type_slug,
          to_tsvector(
            'english',
            setweight(coalesce(ci.title, ''), 'A') || ' ' ||
            setweight(coalesce(ci.excerpt, ''), 'B') || ' ' ||
            setweight(coalesce(ci.markdown, ''), 'C') || ' ' ||
            setweight(coalesce(string_agg(t.name, ' '), ''), 'A')
          ) AS document,
          CASE WHEN lower(ci.title) = lower(${originalQuery}) THEN 1 ELSE 0 END AS exact_title_match,
          CASE WHEN lower(ci.title) LIKE lower(${`${originalQuery}%`}) THEN 1 ELSE 0 END AS title_prefix_match,
          CASE
            WHEN ${diagnosticIntent} AND lower(coalesce(ct.slug, '')) = 'condition' THEN 1
            WHEN ${diagnosticIntent} AND lower(coalesce(ct.slug, '')) = 'postop' THEN -0.3
            ELSE 0
          END AS diagnostic_priority
        FROM "ContentItem" ci
        LEFT JOIN "ContentItemTag" cit ON ci.id = cit."contentItemId"
        LEFT JOIN "Tag" t ON cit."tagId" = t.id
        LEFT JOIN "Region" r ON ci."regionId" = r.id
        LEFT JOIN "ContentType" ct ON ci."contentTypeId" = ct.id
        WHERE 1=1
        ${params.region ? Prisma.sql`AND r.slug = ${params.region}` : Prisma.sql``}
        ${params.type ? Prisma.sql`AND ct.slug = ${params.type}` : Prisma.sql``}
        GROUP BY ci.id, ci.title, ct.slug
      )
      SELECT id
      FROM aggregated
      WHERE document @@ websearch_to_tsquery('english', ${expandedQuery})
      ORDER BY
        exact_title_match DESC,
        title_prefix_match DESC,
        diagnostic_priority DESC,
        ts_rank_cd(document, websearch_to_tsquery('english', ${expandedQuery})) DESC,
        title ASC
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
    take: 12,
    orderBy: [{ updatedAtSource: 'desc' }, { title: 'asc' }],
  });
}

export async function getRelatedByRegionAndTypeSlug(slug: string, regionId?: string | null, typeSlugs: string[] = []) {
  if (!regionId || typeSlugs.length === 0) return [];

  return prisma.contentItem.findMany({
    where: {
      NOT: { slug },
      regionId,
      contentType: { slug: { in: typeSlugs } },
    },
    include: { region: true, contentType: true },
    take: 10,
    orderBy: [{ updatedAtSource: 'desc' }, { title: 'asc' }],
  });
}
