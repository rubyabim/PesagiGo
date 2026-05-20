"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type FeatureKey = "routes" | "bookings" | "payments" | "quotas" | "weather";

export default function AdminFeatureDeletePage() {
  const router = useRouter();
  const params = useParams<{ feature: string; id: string }>();
  const feature = (params.feature || "") as FeatureKey;
  const id = params.id || "";

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  import {
    deleteAdminBooking,
    deleteAdminPayment,
    deleteAdminQuota,
    deleteAdminRoute,
    deleteAdminWeather,
    fetchAdminBookings,
    fetchAdminPayments,
    fetchAdminQuotas,
    fetchAdminRoutes,
    fetchAdminWeather,
  } from "@/lib/api";
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

  useEffect(() => {
    const storedToken =
      localStorage.getItem("cms_access_token") ??
      sessionStorage.getItem("cms_access_token") ??
      "";

    if (!storedToken) {
      router.replace("/");
      return;
    }

    setToken(storedToken);
  }, [router]);

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
    useEffect(() => {
      if (!token) {
        return;
      }

      const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
          if (![
            "routes",
            "bookings",
            "payments",
            "quotas",
            "weather",
          ].includes(feature)) {
            throw new Error("Fitur tidak valid.");
          }

          if (feature === "routes") {
            const rows = await fetchAdminRoutes(token);
            const target = rows.find((item) => item.id === id);
            if (!target) {
              throw new Error("Route tidak ditemukan.");
            }
            setTargetLabel(`${target.name} (${target.mountain.name})`);
          }

          if (feature === "bookings") {
            const rows = await fetchAdminBookings(token);
            const target = rows.find((item) => item.id === id);
            if (!target) {
              throw new Error("Booking tidak ditemukan.");
            }
            setTargetLabel(`${target.user.fullName} - ${target.session.mountain.name}`);
          }

          if (feature === "payments") {
            const rows = await fetchAdminPayments(token);
            const target = rows.find((item) => item.id === id);
            if (!target) {
              throw new Error("Payment tidak ditemukan.");
            }
            setTargetLabel(`${target.method} - ${target.booking.user.email}`);
          }

          if (feature === "quotas") {
            const rows = await fetchAdminQuotas(token);
            const target = rows.find((item) => item.id === id);
            if (!target) {
              throw new Error("Quota tidak ditemukan.");
            }
            setTargetLabel(
              `${target.mountain.name} - ${new Date(target.date).toLocaleString("id-ID")}`,
            );
          }

          if (feature === "weather") {
            const rows = await fetchAdminWeather(token);
            const target = rows.find((item) => item.id === id);
            if (!target) {
              throw new Error("Weather tidak ditemukan.");
            }
            setTargetLabel(`${target.mountain.name} - ${target.condition}`);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [feature, id, token]);

    const onDelete = async () => {
      if (!token) {
        return;
      }

      setBusy(true);
      setError(null);

      try {
        if (feature === "routes") {
          await deleteAdminRoute(token, id);
        }

        if (feature === "bookings") {
          await deleteAdminBooking(token, id);
        }

        if (feature === "payments") {
          await deleteAdminPayment(token, id);
        }

        if (feature === "quotas") {
          await deleteAdminQuota(token, id);
        }

        if (feature === "weather") {
          await deleteAdminWeather(token, id);
        }

        setMessage("Data berhasil dihapus.");
        setTimeout(() => {
          router.push("/admin");
        }, 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus data.");
      } finally {
        setBusy(false);
      }
    };
}
