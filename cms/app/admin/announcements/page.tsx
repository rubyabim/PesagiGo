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
