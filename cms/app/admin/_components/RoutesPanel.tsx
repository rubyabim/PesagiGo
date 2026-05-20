'use client';

import Link from 'next/link';
import { FormEvent } from 'react';
import { AdminTrail } from '@/lib/api';

type Props = {
  loading: boolean;
  busy: boolean;
  tokenReady: boolean;
  mountains: Array<{ id: string; name: string; location: string }>;
  routes: AdminTrail[];
  form: {
    mountainId: string;
    name: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    distanceKm: number;
    estimatedHours: number;
    description: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    mountainId: string;
    name: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    distanceKm: number;
    estimatedHours: number;
    description: string;
  }>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function RoutesPanel({
  loading,
  busy,
  tokenReady,
  mountains,
  routes,
  form,
  setForm,
  onSubmit,
  onReset,
}: Props) {
  return (
    <section className="admin-panel card">
      <div className="admin-panel-head">
        <h2>Routes</h2>
        <p>Tambah route baru dan kelola data rute pendakian.</p>
      </div>

      <form className="admin-form-grid" onSubmit={onSubmit}>
        <label>
          <span>Gunung</span>
          <select
            className="field"
            required
            value={form.mountainId}
            onChange={(event) => setForm((prev) => ({ ...prev, mountainId: event.target.value }))}
          >
            <option value="">Pilih Gunung</option>
            {mountains.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Nama Route</span>
          <input
            className="field"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>

        <label>
          <span>Difficulty</span>
          <select
            className="field"
            value={form.difficulty}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                difficulty: event.target.value as 'EASY' | 'MEDIUM' | 'HARD',
              }))
            }
          >
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </label>

        <label>
          <span>Jarak (km)</span>
          <input
            className="field"
            min={0}
            required
            step="0.1"
            type="number"
            value={form.distanceKm}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, distanceKm: Number(event.target.value || 0) }))
            }
          />
        </label>

        <label>
          <span>Estimasi (jam)</span>
          <input
            className="field"
            min={0}
            required
            step="0.1"
            type="number"
            value={form.estimatedHours}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, estimatedHours: Number(event.target.value || 0) }))
            }
          />
        </label>

        <label className="full">
          <span>Deskripsi</span>
          <input
            className="field"
            required
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>

        <div className="admin-form-actions full">
          <button className="btn btn-primary" disabled={busy || !tokenReady} type="submit">
            Simpan Route
          </button>
          <button className="btn btn-muted" disabled={busy} onClick={onReset} type="button">
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <div className="admin-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="admin-skeleton-card" key={`route-s-${index}`}>
              <div className="admin-skeleton admin-skeleton-line" />
              <div className="admin-skeleton admin-skeleton-line short" />
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-list-grid">
          {routes.length === 0 ? <p className="admin-empty">Belum ada route.</p> : null}
          {routes.map((item) => (
            <article className="admin-list-card" key={item.id}>
              <div>
                <h3>{item.name}</h3>
                <p>
                  {item.mountain.name} ΓÇó {item.difficulty} ΓÇó {item.distanceKm} km ΓÇó {item.estimatedHours} jam
                </p>
              </div>
              <div className="admin-list-actions">
                <Link className="btn btn-muted" href={`/admin/routes/${item.id}/edit`}>
                  Edit
                </Link>
                <Link className="btn btn-danger" href={`/admin/routes/${item.id}/delete`}>
                  Delete
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
