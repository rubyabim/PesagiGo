"use client";

import { useMemo } from "react";

type FeatureKey = "routes" | "bookings" | "payments" | "quotas" | "weather";

export default function AdminFeatureDeletePage() {
  const title = useMemo(() => "Delete Feature", []);

  return (
    <main className="admin-shell">
      <div className="container admin-editor-wrap">
        <section className="card admin-editor-card danger">
          <div className="admin-editor-head">
            <h1>{title}</h1>
          </div>
        </section>
      </div>
    </main>
  );
}
