'use client';

import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { ApiService, BookingItem } from '@/lib/services/api-service';

export default function BookingsPage() {
  return (
    <EntityCrudPage<BookingItem>
      title="Bookings"
      description="CRUD booking pendakian dengan status terintegrasi backend."
      queryKey={['bookings']}
      fields={[
        { key: 'userName', label: 'User Name' },
        { key: 'status', label: 'Status', required: true },
        { key: 'quantity', label: 'Quantity', type: 'number', required: true },
        { key: 'totalPrice', label: 'Total Price', type: 'number', required: true },
      ]}
      columns={[
        { key: 'id', header: 'ID' },
        { key: 'userName', header: 'User' },
        { key: 'status', header: 'Status' },
        { key: 'quantity', header: 'Qty' },
        { key: 'totalPrice', header: 'Total' },
      ]}
      getList={ApiService.getBookings}
      createItem={ApiService.createBooking}
      updateItem={ApiService.updateBooking}
      deleteItem={ApiService.deleteBooking}
    />
  );
}
