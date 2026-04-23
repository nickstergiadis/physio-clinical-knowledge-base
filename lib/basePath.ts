const DEFAULT_BASE_PATH = '/physio-clinical-knowledge-base';

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function stripLeadingSlash(value: string): string {
  return value.replace(/^\/+/, '');
}

function splitPathSuffix(path: string): { pathname: string; suffix: string } {
  const match = path.match(/^[^?#]*/);
  const pathname = match ? match[0] : path;
  const suffix = path.slice(pathname.length);
  return { pathname, suffix };
}

export function getBasePath() {
  const configured = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_PATH || '').trim();
  if (configured) return configured.startsWith('/') ? configured : `/${configured}`;

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    const [firstSegment] = window.location.pathname.split('/').filter(Boolean);
    if (firstSegment) return `/${firstSegment}`;
  }

  return DEFAULT_BASE_PATH;
}

export function normalizeInternalPath(path: string) {
  if (!path) return '/';

  const { pathname, suffix } = splitPathSuffix(path);
  const segments = pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  return `/${segments.join('/')}${suffix}`;
}

export function withBasePath(path: string) {
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path)) return path;

  const normalizedPath = normalizeInternalPath(path);
  const basePath = stripTrailingSlash(getBasePath());

  if (!basePath || basePath === '/') return normalizedPath;
  if (normalizedPath === '/') return `${basePath}/`;

  const withoutLeadingSlash = stripLeadingSlash(normalizedPath);
  const baseWithoutSlash = stripLeadingSlash(basePath);

  if (withoutLeadingSlash === baseWithoutSlash || withoutLeadingSlash.startsWith(`${baseWithoutSlash}/`)) {
    return normalizedPath;
  }

  return `${basePath}/${withoutLeadingSlash}`;
}
