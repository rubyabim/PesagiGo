'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import DataTable from '@/components/ui/data-table';
import { ApiService, PaymentItem } from '@/lib/services/api-service';

export default function PaymentsPage() {
  const [paymentId, setPaymentId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [method, setMethod] = useState('VA-BCA');
  const [amount, setAmount] = useState(0);
  const [history, setHistory] = useState<PaymentItem[]>([]);

  const paymentQuery = useQuery({
    queryKey: ['payment-by-id', paymentId],
    queryFn: () => ApiService.getPaymentById(paymentId),
    enabled: Boolean(paymentId),
  });

  const createMutation = useMutation({
    mutationFn: ApiService.createPayment,
    onSuccess: (data) => {
      toast.success('Payment berhasil dibuat');
      setHistory((prev) => [data, ...prev]);
      setPaymentId(String(data.id));
    },
    onError: (err) => toast.error(err.message),
  });

  const webhookMutation = useMutation({
    mutationFn: ApiService.paymentWebhook,
    onSuccess: () => toast.success('Webhook berhasil dikirim'),
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({ bookingId, method, amount });
