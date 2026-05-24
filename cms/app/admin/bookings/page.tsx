'use client';

import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { ApiService, BookingItem } from '@/lib/services/api-service';

export default function BookingsPage() {
  return (
    <EntityCrudPage<BookingItem>
      title="Booking / Pesanan"
      description="Kelola pesanan tiket pendakian dengan status terintegrasi backend."
      queryKey={['bookings']}
      fields={[
        { key: 'userName', label: 'Nama Pendaki' },
        { key: 'status', label: 'Status', required: true },
        { key: 'quantity', label: 'Jumlah Pendaki', type: 'number', required: true },
        { key: 'totalPrice', label: 'Total Bayar', type: 'number', required: true },
      ]}
      columns={[
        { key: 'id', header: 'ID' },
        { key: 'userName', header: 'Nama' },
        { key: 'status', header: 'Status' },
        { key: 'quantity', header: 'Pendaki' },
        { key: 'totalPrice', header: 'Total' },
      ]}
      getList={ApiService.getBookings}
      createItem={ApiService.createBooking}
      updateItem={ApiService.updateBooking}
      deleteItem={ApiService.deleteBooking}
    />
  );
}
