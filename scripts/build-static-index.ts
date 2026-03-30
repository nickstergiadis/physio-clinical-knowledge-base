import fs from 'node:fs';
import path from 'node:path';
import { getKnowledgeBaseItems } from '../lib/kb';

const outDir = path.resolve('public/data');
fs.mkdirSync(outDir, { recursive: true });

const items = getKnowledgeBaseItems();

const searchIndex = items.map((item) => ({
  slug: item.slug,
  title: item.title,
  section: item.section,
  sectionLabel: item.sectionLabel,
  region: item.region,
  aliases: item.aliases,
  tags: item.tags,
  summary: item.summary,
  excerpt: item.excerpt,
  sourcePath: item.sourcePath,
}));

fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify(searchIndex, null, 2));
fs.writeFileSync(
  path.join(outDir, 'related-content.json'),
  JSON.stringify(items.map((item) => ({ slug: item.slug, related: item.related })), null, 2),
);

console.log(`Built static JSON indexes for ${items.length} pages.`);
