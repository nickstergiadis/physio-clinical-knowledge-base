import { getAdminDashboardData } from '@/lib/admin';

function fmtDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export default async function AdminPage() {
  const data = await getAdminDashboardData();
  const issues = data.status
    ? data.status.summary.missingTitles.length +
      data.status.summary.duplicateSlugs.length +
      data.status.summary.missingInference.length +
      data.status.summary.brokenRelatedLinks.length +
      data.status.summary.frontmatterConsistency.length
    : 0;

  return (
    <section>
      <h1>Knowledge Base Admin</h1>
      <p className="muted">
        Repo-first maintenance dashboard. Source markdown remains in <code>/knowledge_base_source</code>.
      </p>

      <div className="admin-grid">
        <article className="admin-card">
          <h2>Import Status</h2>
          {data.status ? (
            <ul className="clean">
              <li><strong>Status:</strong> {data.status.status}</li>
              <li><strong>Last Import:</strong> {fmtDate(data.status.lastImportAt)}</li>
              <li><strong>Report Generated:</strong> {fmtDate(data.status.generatedAt)}</li>
              <li><strong>Files Seen:</strong> {data.status.fileCount}</li>
              <li><strong>Changes Pending:</strong> {data.status.changed ? 'yes' : 'no'}</li>
              <li><strong>Validation Issues:</strong> {issues}</li>
            </ul>
          ) : (
            <p>No import status yet. Run <code>npm run import:kb</code>.</p>
          )}
        </article>

        <article className="admin-card">
          <h2>Content Counts by Type</h2>
          <ul className="clean">
            {data.typeCounts.map((item) => (
              <li key={item.name}>{item.name}: {item.count}</li>
            ))}
          </ul>
        </article>

        <article className="admin-card">
          <h2>Content Counts by Region</h2>
          <ul className="clean">
            {data.regionCounts.map((item) => (
              <li key={item.name}>{item.name}: {item.count}</li>
            ))}
          </ul>
        </article>
      </div>

      {data.status && (
        <>
          <h2>Validation Issues</h2>
          <div className="admin-grid">
            <article className="admin-card">
              <h3>Missing titles ({data.status.summary.missingTitles.length})</h3>
              <ul className="clean issue-list">
                {data.status.summary.missingTitles.slice(0, 20).map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            </article>

            <article className="admin-card">
              <h3>Duplicate slugs ({data.status.summary.duplicateSlugs.length})</h3>
              <ul className="clean issue-list">
                {data.status.summary.duplicateSlugs.slice(0, 20).map((dup) => (
                  <li key={dup.slug}>
                    <strong>{dup.slug}</strong>
                    <div>{dup.files.join(', ')}</div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="admin-card">
              <h3>Missing region/type inference ({data.status.summary.missingInference.length})</h3>
              <ul className="clean issue-list">
                {data.status.summary.missingInference.slice(0, 20).map((issue) => (
                  <li key={issue.sourcePath}>{issue.sourcePath} ({issue.missing.join(', ')})</li>
                ))}
              </ul>
            </article>

            <article className="admin-card">
              <h3>Broken related links ({data.status.summary.brokenRelatedLinks.length})</h3>
              <ul className="clean issue-list">
                {data.status.summary.brokenRelatedLinks.slice(0, 20).map((issue, idx) => (
                  <li key={`${issue.sourcePath}-${idx}`}>{issue.sourcePath} → {issue.link}</li>
                ))}
              </ul>
            </article>

            <article className="admin-card">
              <h3>Frontmatter consistency ({data.status.summary.frontmatterConsistency.length})</h3>
              <ul className="clean issue-list">
                {data.status.summary.frontmatterConsistency.slice(0, 20).map((issue, idx) => (
                  <li key={`${issue.sourcePath}-${idx}`}>{issue.sourcePath} ({issue.issue})</li>
                ))}
              </ul>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
