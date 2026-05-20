'use client';

import Image from 'next/image';
import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { ApiService, News } from '@/lib/services/api-service';

export default function NewsPage() {
  return (
    <EntityCrudPage<News>
      title="Berita / Artikel"
      description="Kelola berita terbaru dalam format card modern."
      queryKey={['news']}
      fields={[
              { key: 'title', label: 'Judul', required: true },
              { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
              { key: 'imageUrl', label: 'URL Gambar' },
              { key: 'mapUrl', label: 'Google Maps (URL embed)', type: 'url' },
              { key: 'publishedAt', label: 'Tanggal Publish', type: 'datetime-local' },
            ]}
      columns={[
        { key: 'title', header: 'Judul' },
