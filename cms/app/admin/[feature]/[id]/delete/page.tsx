"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type FeatureKey = "routes" | "bookings" | "payments" | "quotas" | "weather";

export default function AdminFeatureDeletePage() {
  const router = useRouter();
  const params = useParams<{ feature: string; id: string }>();
  const feature = (params.feature || "") as FeatureKey;
  const id = params.id || "";

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [targetLabel, setTargetLabel] = useState("");

  const title = useMemo(() => {
    if (feature === "routes") {
      return "Delete Route";
    }
    if (feature === "bookings") {
      return "Delete Booking";
    }
    if (feature === "payments") {
      return "Delete Payment";
    }
    if (feature === "quotas") {
      return "Delete Quota";
    }
    if (feature === "weather") {
      return "Delete Weather";
    }
    return "Feature Tidak Dikenal";
  }, [feature]);

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
