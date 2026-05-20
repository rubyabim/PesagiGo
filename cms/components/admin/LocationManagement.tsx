'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash, MapPin } from 'lucide-react';
import MapView from './MapView';
import axios from 'axios';

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  type: z.string().default('POI'),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface Location extends LocationFormData {
  id: string;
  createdAt: string;
}

const LocationManagement = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  // Fetch locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await axios.get('/api/locations');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const response = await axios.post('/api/locations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location created successfully');
      setIsOpen(false);
      reset();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const response = await axios.patch(`/api/locations/${editingId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
      setIsOpen(false);
      setEditingId(null);
      reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
  });

  const onSubmit = (data: LocationFormData) => {
    if (editingId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    Object.keys(location).forEach((key) => {
      if (key !== 'id' && key !== 'createdAt') {
        const fieldKey = key as keyof LocationFormData;
        const fieldValue = location[key as keyof Location];
        if (
          typeof fieldValue === 'string' ||
          typeof fieldValue === 'number' ||
          typeof fieldValue === 'undefined'
        ) {
          setValue(fieldKey, fieldValue);
        }
      }
    });
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setEditingId(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Map View */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Lokasi Peta
        </h3>
        <MapView locations={locations} />
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Manajemen Lokasi</h3>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Lokasi
            </button>
          )}
        </div>

        {isOpen && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lokasi *</label>
                <input
                  {...register('name')}
                  type="text"
