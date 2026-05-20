'use client';

import Link from 'next/link';
import { AdminBooking, AdminTicketSalesSummary } from '@/lib/api';

const numberFormat = new Intl.NumberFormat('id-ID');

type Props = {
  loading: boolean;
  bookings: AdminBooking[];
  ticketHistory: AdminBooking[];
  ticketSales: AdminTicketSalesSummary;
};

export default function BookingsPanel({
  loading,
  bookings,
  ticketHistory,
  ticketSales,
}: Props) {
  return (
    <section className="admin-panel card">
      <div className="admin-panel-head">
        <h2>Bookings</h2>
        <p>Kelola data booking, ticket history, dan ringkasan penjualan.</p>
      </div>

      <div className="admin-booking-stats">
        <article className="card admin-mini-stat">
          <p>Tiket Terjual Hari Ini</p>
          <strong>{numberFormat.format(ticketSales.soldDaily)}</strong>
        </article>
        <article className="card admin-mini-stat">
          <p>Tiket Terjual Bulan Ini</p>
          <strong>{numberFormat.format(ticketSales.soldMonthly)}</strong>
        </article>
        <article className="card admin-mini-stat">
          <p>Total Tiket Terjual</p>
          <strong>{numberFormat.format(ticketSales.soldTotal)}</strong>
        </article>
      </div>

      {loading ? (
        <div className="admin-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="admin-skeleton-card" key={`booking-s-${index}`}>
              <div className="admin-skeleton admin-skeleton-line" />
              <div className="admin-skeleton admin-skeleton-line short" />
            </article>
          ))}
        </div>
      ) : (
        <>
          <div className="admin-list-grid">
            {bookings.length === 0 ? <p className="admin-empty">Belum ada booking.</p> : null}
            {bookings.map((item) => (
              <article className="admin-list-card" key={item.id}>
                <div>
                  <h3>{item.user.fullName}</h3>
                  <p>
                    {item.session.mountain.name} ΓÇó {item.status} ΓÇó Qty {item.quantity} ΓÇó Rp{numberFormat.format(item.totalPrice)}
                  </p>
                </div>
                <div className="admin-list-actions">
                  <Link className="btn btn-muted" href={`/admin/bookings/${item.id}/edit`}>
                    Edit
                  </Link>
                  <Link className="btn btn-danger" href={`/admin/bookings/${item.id}/delete`}>
                    Delete
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {ticketHistory.length > 0 ? (
            <section className="card admin-history-card">
              <h3>Ticket History</h3>
              <div className="admin-history-list">
                {ticketHistory.slice(0, 12).map((item) => (
                  <article className="admin-history-item" key={`h-${item.id}`}>
                    <p>{item.user.fullName} ΓÇó {item.session.mountain.name}</p>
                    <span>
                      Ticket: {item.ticketCode ?? '-'} ΓÇó Status: {item.ticketStatus} ΓÇó {new Date(item.createdAt).toLocaleString('id-ID')}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </section>
  );
}
