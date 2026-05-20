'use client';

import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { Announcement, ApiService } from '@/lib/services/api-service';

export default function AnnouncementsPage() {
  return (
    <EntityCrudPage<Announcement>
      title="Informasi Penting"
      description="Kelola pengumuman penting untuk admin dan pengguna."
      queryKey={['announcements']}
      fields={[
              { key: 'title', label: 'Judul', required: true },
              { key: 'content', label: 'Isi', type: 'textarea', required: true },
              {
                key: 'level',
                label: 'Level',
                type: 'select',
                options: [
                  { value: 'INFO', label: 'Info' },
                  { value: 'WARNING', label: 'Warning' },
                  { value: 'DANGER', label: 'Danger' },
                ],
              },
              { key: 'imageUrl', label: 'Foto (URL atau upload)', type: 'url' },
              { key: 'mapUrl', label: 'Google Maps (URL embed)', type: 'url' },
            ]}
      columns={[
        { key: 'title', header: 'Judul' },
        { key: 'content', header: 'Isi' },
        { key: 'level', header: 'Level' },
      ]}
      getList={ApiService.getAnnouncements}
      createItem={ApiService.createAnnouncement}
      updateItem={ApiService.updateAnnouncement}
      deleteItem={ApiService.deleteAnnouncement}
    />
  );
}
