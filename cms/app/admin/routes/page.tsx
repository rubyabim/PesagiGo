'use client';

import { useQuery } from '@tanstack/react-query';
import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { ApiService, RouteItem } from '@/lib/services/api-service';

export default function RoutesPage() {
  const mountainsQuery = useQuery({
    queryKey: ['mountains-for-routes'],
    queryFn: ApiService.getMountains,
  });

  const mountainOptions = (mountainsQuery.data ?? []).map((mountain) => ({
    value: mountain.id,
    label: `${mountain.name} (${mountain.location})`,
  }));

  return (
    <EntityCrudPage<RouteItem>
      title="Routes"
      description="CRUD jalur pendakian melalui endpoint admin."
      queryKey={['routes']}
      fields={[
        {
          key: 'mountainId',
          label: 'Gunung',
          type: 'select',
          required: true,
          options: mountainOptions,
        },
        { key: 'name', label: 'Nama Route', required: true },
        {
          key: 'difficulty',
          label: 'Difficulty',
          type: 'select',
          required: true,
          options: [
            { value: 'EASY', label: 'Easy' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HARD', label: 'Hard' },
          ],
        },
        { key: 'distanceKm', label: 'Distance (km)', type: 'number', required: true },
        { key: 'estimatedHours', label: 'Estimasi Jam', type: 'number', required: true },
        { key: 'description', label: 'Deskripsi Jalur', type: 'textarea', required: true },
      ]}
      columns={[
        {
          key: 'mountain',
          header: 'Gunung',
          render: (row) => row.mountain?.name ?? row.mountainId ?? '-',
        },
        { key: 'name', header: 'Route' },
        { key: 'difficulty', header: 'Difficulty' },
        { key: 'distanceKm', header: 'Distance' },
        { key: 'estimatedHours', header: 'Hours' },
      ]}
      getList={ApiService.getRoutes}
      createItem={ApiService.createRoute}
      updateItem={ApiService.updateRoute}
      deleteItem={ApiService.deleteRoute}
    />
  );
}
