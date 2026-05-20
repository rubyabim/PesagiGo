'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiService } from '@/lib/services/api-service';

export default function BasecampPage() {
  const [basecampId, setBasecampId] = useState('1');

  const basecampQuery = useQuery({
    queryKey: ['basecamp', basecampId],
    queryFn: () => ApiService.getBasecampById(basecampId),
    enabled: Boolean(basecampId),
  });

  const mapSrc = basecampQuery.data?.mapUrl
    ? basecampQuery.data.mapUrl
    : basecampQuery.data?.latitude && basecampQuery.data?.longitude
      ? `https://www.google.com/maps?q=${basecampQuery.data.latitude},${basecampQuery.data.longitude}&z=14&output=embed`
