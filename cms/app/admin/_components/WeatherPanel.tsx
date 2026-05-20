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
