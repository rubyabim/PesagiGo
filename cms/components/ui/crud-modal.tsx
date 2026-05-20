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
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
