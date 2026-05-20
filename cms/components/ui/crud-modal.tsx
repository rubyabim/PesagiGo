'use client';

import { ReactNode } from 'react';

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export default function CrudModal({ open, title, children, onClose }: Props) {
  if (!open) {
    return null;
  }

  return (
