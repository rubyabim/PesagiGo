'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash, Cloud, Sync } from 'lucide-react';
import axios from 'axios';

const weatherSchema = z.object({
  mountainId: z.string().min(1, 'Mountain is required'),
  forecastDate: z.string().min(1, 'Date is required'),
  condition: z.enum(['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN', 'STORM', 'FOG']),
  temperatureC: z.number().min(-50).max(60, 'Invalid temperature'),
  windKph: z.number().min(0).optional(),
  note: z.string().optional(),
});

type WeatherFormData = z.infer<typeof weatherSchema>;

interface Weather extends WeatherFormData {
  id: string;
  mountain?: { id: string; name: string };
  createdAt: string;
}

interface Mountain {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const WeatherManagement = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<WeatherFormData>({
    resolver: zodResolver(weatherSchema),
    defaultValues: {
      forecastDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch weather data
  const { data: weatherData = [], isLoading: weatherLoading } = useQuery({
    queryKey: ['weather'],
    queryFn: async () => {
      const response = await axios.get('/api/weather');
      return response.data;
    },
  });

  // Fetch mountains
  const { data: mountains = [] } = useQuery({
    queryKey: ['mountains'],
    queryFn: async () => {
      const response = await axios.get('/api/mountains');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: WeatherFormData) => {
      const response = await axios.post('/api/weather', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      toast.success('Prakiraan cuaca ditambahkan');
      setIsOpen(false);
      reset({
        forecastDate: new Date().toISOString().split('T')[0],
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: WeatherFormData) => {
      const response = await axios.patch(`/api/weather/${editingId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      toast.success('Prakiraan cuaca diperbarui');
      setIsOpen(false);
      setEditingId(null);
      reset({
        forecastDate: new Date().toISOString().split('T')[0],
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/weather/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      toast.success('Prakiraan cuaca dihapus');
    },
  });

  // Sync weather mutation
  const syncMutation = useMutation({
    mutationFn: async (mountainId: string) => {
      const response = await axios.post(`/api/weather/sync/${mountainId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      toast.success('Data cuaca disinkronkan');
    },
  });

  const onSubmit = (data: WeatherFormData) => {
    if (editingId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (weather: Weather) => {
    setEditingId(weather.id);
    Object.keys(weather).forEach((key) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'mountain') {
        if (key === 'forecastDate') {
          setValue('forecastDate', new Date(String(weather[key as keyof Weather])).toISOString().split('T')[0]);
        } else {
          const formKey = key as keyof WeatherFormData;
          const fieldValue = weather[key as keyof Weather];
          if (
            typeof fieldValue === 'string' ||
            typeof fieldValue === 'number' ||
            typeof fieldValue === 'undefined'
          ) {
            setValue(formKey, fieldValue);
          }
        }
      }
    });
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setEditingId(null);
    reset({
      forecastDate: new Date().toISOString().split('T')[0],
    });
  };

  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, string> = {
      SUNNY: 'ΓÿÇ∩╕Å',
      CLOUDY: 'Γÿü∩╕Å',
      LIGHT_RAIN: '≡ƒîª∩╕Å',
      HEAVY_RAIN: '≡ƒîº∩╕Å',
      STORM: 'Γ¢ê∩╕Å',
      FOG: '≡ƒî½∩╕Å',
    };
    return icons[condition] || '≡ƒîí∩╕Å';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Manajemen Prakiraan Cuaca Real-time
          </h3>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Prakiraan
