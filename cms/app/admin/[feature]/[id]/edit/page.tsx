'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AdminBooking,
  fetchAdminBookings,
  fetchAdminPayments,
  fetchAdminQuotas,
  fetchAdminRoutes,
  fetchAdminWeather,
  fetchMountains,
  updateAdminBooking,
  updateAdminPayment,
  updateAdminQuota,
  updateAdminRoute,
  updateAdminWeather,
} from '@/lib/api';

type FeatureKey = 'routes' | 'bookings' | 'payments' | 'quotas' | 'weather';

function toDatetimeLocal(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function localToIso(value: string) {
  if (!value) {
    return '';
  }
  return new Date(value).toISOString();
}

export default function AdminFeatureEditPage() {
  const router = useRouter();
  const params = useParams<{ feature: string; id: string }>();
  const feature = (params.feature || '') as FeatureKey;
  const id = params.id || '';

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const [mountains, setMountains] = useState<Array<{ id: string; name: string }>>([]);
  const [bookingOptions, setBookingOptions] = useState<AdminBooking[]>([]);

  const [routeForm, setRouteForm] = useState({
    mountainId: '',
    name: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    distanceKm: 0,
    estimatedHours: 0,
    description: '',
  });

  const [bookingForm, setBookingForm] = useState({
    status: 'PENDING_PAYMENT' as 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED',
    quantity: 1,
  });

  const [paymentForm, setPaymentForm] = useState({
    bookingId: '',
    method: 'VA-BCA',
    amount: 0,
    status: 'PENDING' as 'PENDING' | 'SUCCESS' | 'FAILED',
    providerRef: '',
    paidAt: '',
  });

  const [quotaForm, setQuotaForm] = useState({
    date: '',
    quotaTotal: 0,
    quotaBooked: 0,
    price: 0,
  });

  const [weatherForm, setWeatherForm] = useState({
    forecastDate: '',
    condition: 'CLOUDY' as
      | 'SUNNY'
      | 'CLOUDY'
      | 'LIGHT_RAIN'
      | 'HEAVY_RAIN'
      | 'STORM'
      | 'FOG',
    temperatureC: 0,
    windKph: 0,
    note: '',
  });

  const title = useMemo(() => {
    if (feature === 'routes') {
      return 'Edit Route';
    }
    if (feature === 'bookings') {
      return 'Edit Booking';
    }
    if (feature === 'payments') {
      return 'Edit Payment';
    }
    if (feature === 'quotas') {
      return 'Edit Quota';
    }
    if (feature === 'weather') {
      return 'Edit Weather';
    }
    return 'Feature Tidak Dikenal';
  }, [feature]);

  useEffect(() => {
    const storedToken =
      localStorage.getItem('cms_access_token') ??
      sessionStorage.getItem('cms_access_token') ??
      '';

    if (!storedToken) {
      router.replace('/');
      return;
    }

    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!['routes', 'bookings', 'payments', 'quotas', 'weather'].includes(feature)) {
          throw new Error('Fitur tidak valid.');
        }

        if (feature === 'routes') {
          const [routeRows, mountainRows] = await Promise.all([
            fetchAdminRoutes(token),
            fetchMountains(),
          ]);
          const target = routeRows.find((item) => item.id === id);
          if (!target) {
            throw new Error('Data route tidak ditemukan.');
          }

          setMountains(mountainRows.map((item) => ({ id: item.id, name: item.name })));
          setRouteForm({
            mountainId: target.mountainId,
            name: target.name,
            difficulty: target.difficulty,
            distanceKm: target.distanceKm,
            estimatedHours: target.estimatedHours,
            description: target.description,
          });
        }

        if (feature === 'bookings') {
          const bookingRows = await fetchAdminBookings(token);
          const target = bookingRows.find((item) => item.id === id);
          if (!target) {
            throw new Error('Data booking tidak ditemukan.');
          }

          setBookingForm({
            status: target.status,
            quantity: target.quantity,
          });
        }

        if (feature === 'payments') {
          const [paymentRows, bookingRows] = await Promise.all([
            fetchAdminPayments(token),
            fetchAdminBookings(token),
          ]);
          const target = paymentRows.find((item) => item.id === id);
          if (!target) {
            throw new Error('Data payment tidak ditemukan.');
          }

          setBookingOptions(bookingRows);
          setPaymentForm({
            bookingId: target.bookingId,
            method: target.method,
            amount: target.amount,
            status: target.status,
            providerRef: target.providerRef ?? '',
            paidAt: toDatetimeLocal(target.paidAt),
          });
        }

        if (feature === 'quotas') {
          const quotaRows = await fetchAdminQuotas(token);
          const target = quotaRows.find((item) => item.id === id);
          if (!target) {
            throw new Error('Data quota tidak ditemukan.');
          }

          setQuotaForm({
            date: toDatetimeLocal(target.date),
            quotaTotal: target.quotaTotal,
            quotaBooked: target.quotaBooked,
            price: target.price,
          });
        }

        if (feature === 'weather') {
          const weatherRows = await fetchAdminWeather(token);
          const target = weatherRows.find((item) => item.id === id);
          if (!target) {
            throw new Error('Data weather tidak ditemukan.');
          }

          setWeatherForm({
            forecastDate: toDatetimeLocal(target.forecastDate),
            condition: target.condition,
            temperatureC: target.temperatureC,
            windKph: target.windKph ?? 0,
            note: target.note ?? '',
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [feature, id, token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (feature === 'routes') {
        await updateAdminRoute(token, id, routeForm);
      }

      if (feature === 'bookings') {
        await updateAdminBooking(token, id, bookingForm);
      }

      if (feature === 'payments') {
        await updateAdminPayment(token, id, {
          method: paymentForm.method,
          amount: paymentForm.amount,
          status: paymentForm.status,
          providerRef: paymentForm.providerRef,
          paidAt: paymentForm.paidAt ? localToIso(paymentForm.paidAt) : undefined,
        });
      }

      if (feature === 'quotas') {
        await updateAdminQuota(token, id, {
          date: quotaForm.date ? localToIso(quotaForm.date) : undefined,
          quotaTotal: quotaForm.quotaTotal,
          quotaBooked: quotaForm.quotaBooked,
          price: quotaForm.price,
        });
      }

      if (feature === 'weather') {
        await updateAdminWeather(token, id, {
          forecastDate: weatherForm.forecastDate
            ? localToIso(weatherForm.forecastDate)
            : undefined,
          condition: weatherForm.condition,
          temperatureC: weatherForm.temperatureC,
          windKph: weatherForm.windKph,
          note: weatherForm.note,
        });
      }

      setMessage('Data berhasil diperbarui.');
      setTimeout(() => {
        router.push('/admin');
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-shell">
      <div className="container admin-editor-wrap">
        <section className="card admin-editor-card">
          <div className="admin-editor-head">
            <h1>{title}</h1>
            <button className="btn btn-muted" onClick={() => router.push('/admin')} type="button">
              Kembali ke Dashboard
            </button>
          </div>

          {message ? <p className="admin-alert success">{message}</p> : null}
          {error ? <p className="admin-alert error">{error}</p> : null}

          {loading ? (
            <div className="admin-skeleton-grid">
              {Array.from({ length: 3 }).map((_, index) => (
                <article className="admin-skeleton-card" key={`ed-s-${index}`}>
                  <div className="admin-skeleton admin-skeleton-line" />
                  <div className="admin-skeleton admin-skeleton-line short" />
                </article>
              ))}
            </div>
          ) : (
            <form className="admin-form-grid" onSubmit={onSubmit}>
              {feature === 'routes' ? (
                <>
                  <label>
                    <span>Gunung</span>
                    <select
                      className="field"
                      required
                      value={routeForm.mountainId}
                      onChange={(event) =>
                        setRouteForm((prev) => ({ ...prev, mountainId: event.target.value }))
                      }
                    >
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
                      value={routeForm.name}
                      onChange={(event) =>
                        setRouteForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                    />
                  </label>

                  <label>
                    <span>Difficulty</span>
                    <select
                      className="field"
                      value={routeForm.difficulty}
                      onChange={(event) =>
                        setRouteForm((prev) => ({
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
                      value={routeForm.distanceKm}
                      onChange={(event) =>
                        setRouteForm((prev) => ({
                          ...prev,
                          distanceKm: Number(event.target.value || 0),
                        }))
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
                      value={routeForm.estimatedHours}
                      onChange={(event) =>
                        setRouteForm((prev) => ({
                          ...prev,
                          estimatedHours: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </label>

                  <label className="full">
                    <span>Deskripsi</span>
                    <input
                      className="field"
                      required
                      value={routeForm.description}
                      onChange={(event) =>
                        setRouteForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                    />
                  </label>
                </>
              ) : null}

              {feature === 'bookings' ? (
                <>
                  <label>
                    <span>Status</span>
                    <select
                      className="field"
                      value={bookingForm.status}
                      onChange={(event) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          status: event.target.value as
                            | 'PENDING_PAYMENT'
                            | 'PAID'
                            | 'CANCELLED',
                        }))
                      }
                    >
                      <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                      <option value="PAID">PAID</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </label>

                  <label>
                    <span>Quantity</span>
                    <input
                      className="field"
                      min={1}
                      type="number"
                      value={bookingForm.quantity}
                      onChange={(event) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          quantity: Number(event.target.value || 1),
                        }))
                      }
                    />
                  </label>
                </>
              ) : null}

              {feature === 'payments' ? (
                <>
                  <label>
                    <span>Booking</span>
                    <select
                      className="field"
                      required
                      value={paymentForm.bookingId}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({ ...prev, bookingId: event.target.value }))
                      }
                    >
                      {bookingOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.id.slice(0, 8)} - {item.user.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Method</span>
                    <input
                      className="field"
                      required
                      value={paymentForm.method}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({ ...prev, method: event.target.value }))
                      }
                    />
                  </label>

                  <label>
                    <span>Amount</span>
                    <input
                      className="field"
                      min={0}
                      required
                      type="number"
                      value={paymentForm.amount}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          amount: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Status</span>
                    <select
                      className="field"
                      value={paymentForm.status}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          status: event.target.value as 'PENDING' | 'SUCCESS' | 'FAILED',
                        }))
                      }
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </label>

                  <label>
                    <span>Provider Ref</span>
                    <input
                      className="field"
                      value={paymentForm.providerRef}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({ ...prev, providerRef: event.target.value }))
                      }
                    />
                  </label>

                  <label>
                    <span>Paid At</span>
                    <input
                      className="field"
                      type="datetime-local"
                      value={paymentForm.paidAt}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({ ...prev, paidAt: event.target.value }))
                      }
                    />
                  </label>
                </>
              ) : null}

              {feature === 'quotas' ? (
                <>
                  <label>
                    <span>Date</span>
                    <input
                      className="field"
                      required
                      type="datetime-local"
                      value={quotaForm.date}
                      onChange={(event) =>
                        setQuotaForm((prev) => ({ ...prev, date: event.target.value }))
                      }
                    />
                  </label>

                  <label>
                    <span>Quota Total</span>
                    <input
                      className="field"
                      min={0}
                      required
                      type="number"
                      value={quotaForm.quotaTotal}
                      onChange={(event) =>
                        setQuotaForm((prev) => ({
                          ...prev,
                          quotaTotal: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Quota Booked</span>
                    <input
                      className="field"
                      min={0}
                      required
                      type="number"
                      value={quotaForm.quotaBooked}
                      onChange={(event) =>
                        setQuotaForm((prev) => ({
                          ...prev,
                          quotaBooked: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Price</span>
                    <input
                      className="field"
                      min={0}
                      required
                      type="number"
                      value={quotaForm.price}
                      onChange={(event) =>
                        setQuotaForm((prev) => ({
                          ...prev,
                          price: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </label>
                </>
              ) : null}

              {feature === 'weather' ? (
                <>
                  <label>
                    <span>Forecast Date</span>
                    <input
                      className="field"
                      required
                      type="datetime-local"
                      value={weatherForm.forecastDate}
                      onChange={(event) =>
                        setWeatherForm((prev) => ({
                          ...prev,
                          forecastDate: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Condition</span>
                    <select
                      className="field"
                      value={weatherForm.condition}
                      onChange={(event) =>
                        setWeatherForm((prev) => ({
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
                      {['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN', 'STORM', 'FOG'].map((item) => (
                        <option key={item} value={item}>
                          {item}
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
                      value={weatherForm.temperatureC}
                      onChange={(event) =>
                        setWeatherForm((prev) => ({
                          ...prev,
                          temperatureC: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>Wind (kph)</span>
                    <input
                      className="field"
                      type="number"
                      value={weatherForm.windKph}
                      onChange={(event) =>
                        setWeatherForm((prev) => ({
                          ...prev,
                          windKph: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </label>

                  <label className="full">
                    <span>Note</span>
                    <input
                      className="field"
                      value={weatherForm.note}
                      onChange={(event) =>
                        setWeatherForm((prev) => ({ ...prev, note: event.target.value }))
                      }
                    />
                  </label>
                </>
              ) : null}

              <div className="admin-form-actions full">
                <button className="btn btn-primary" disabled={busy} type="submit">
                  {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
