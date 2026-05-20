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
