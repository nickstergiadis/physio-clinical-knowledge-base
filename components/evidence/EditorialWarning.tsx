export function EditorialWarning({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <section className="card editorial-warning" role="status" aria-live="polite">
      <h2>Editorial warning</h2>
      <p>{message}</p>
    </section>
  );
}
