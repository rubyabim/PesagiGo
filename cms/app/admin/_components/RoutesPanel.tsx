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
