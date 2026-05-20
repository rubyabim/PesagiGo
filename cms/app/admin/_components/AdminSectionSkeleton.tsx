'use client';

export default function AdminSectionSkeleton() {
  return (
    <section className="admin-panel card">
      <div className="admin-skeleton admin-skeleton-title" />
      <div className="admin-skeleton-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <article className="admin-skeleton-card" key={`s-${index}`}>
            <div className="admin-skeleton admin-skeleton-line" />
            <div className="admin-skeleton admin-skeleton-line short" />
          </article>
        ))}
      </div>
    </section>
  );
}
