'use client';

import Link from 'next/link';
import { FormEvent } from 'react';
import { AdminWeather } from '@/lib/api';

type Props = {
  loading: boolean;
  busy: boolean;
  tokenReady: boolean;
  mountains: Array<{ id: string; name: string; location: string }>;
  weathers: AdminWeather[];
  form: {
    mountainId: string;
    forecastDate: string;
    condition: 'SUNNY' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG';
    temperatureC: number;
    windKph: number;
    note: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    mountainId: string;
    forecastDate: string;
    condition: 'SUNNY' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG';
    temperatureC: number;
    windKph: number;
    note: string;
  }>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function WeatherPanel({
  loading,
  busy,
  tokenReady,
  mountains,
  weathers,
  form,
  setForm,
  onSubmit,
  onReset,
}: Props) {
  return (
    <section className="admin-panel card">
      <div className="admin-panel-head">
        <h2>Weather</h2>
        <p>Tambah prakiraan cuaca dan kelola edit/delete melalui halaman terpisah.</p>
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
          <span>Forecast Date</span>
          <input
            className="field"
            required
            type="datetime-local"
            value={form.forecastDate}
            onChange={(event) => setForm((prev) => ({ ...prev, forecastDate: event.target.value }))}
          />
        </label>

        <label>
          <span>Condition</span>
          <select
            className="field"
            value={form.condition}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                condition: event.target.value as
                  | 'SUNNY'
                  | 'CLOUDY'
                  | 'LIGHT_RAIN'
                  | 'HEAVY_RAIN'
                  | 'STORM'
                  | 'FOG',
              }))
            }
          >
            {['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN', 'STORM', 'FOG'].map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Temperature (C)</span>
          <input
            className="field"
            required
            type="number"
            value={form.temperatureC}
            onChange={(event) => setForm((prev) => ({ ...prev, temperatureC: Number(event.target.value || 0) }))}
          />
        </label>

        <label>
          <span>Wind (kph)</span>
          <input
            className="field"
            type="number"
            value={form.windKph}
            onChange={(event) => setForm((prev) => ({ ...prev, windKph: Number(event.target.value || 0) }))}
          />
        </label>

        <label>
          <span>Note</span>
          <input
            className="field"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
        </label>

        <div className="admin-form-actions full">
          <button className="btn btn-primary" disabled={busy || !tokenReady} type="submit">
            Simpan Weather
          </button>
          <button className="btn btn-muted" disabled={busy} onClick={onReset} type="button">
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <div className="admin-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="admin-skeleton-card" key={`weather-s-${index}`}>
              <div className="admin-skeleton admin-skeleton-line" />
              <div className="admin-skeleton admin-skeleton-line short" />
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-list-grid">
          {weathers.length === 0 ? <p className="admin-empty">Belum ada weather.</p> : null}
          {weathers.map((item) => (
            <article className="admin-list-card" key={item.id}>
              <div>
                <h3>{item.mountain.name}</h3>
                <p>
                  {new Date(item.forecastDate).toLocaleString('id-ID')} ΓÇó {item.condition} ΓÇó {item.temperatureC}C
                </p>
              </div>
              <div className="admin-list-actions">
                <Link className="btn btn-muted" href={`/admin/weather/${item.id}/edit`}>
                  Edit
                </Link>
                <Link className="btn btn-danger" href={`/admin/weather/${item.id}/delete`}>
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
