import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  return `$${(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateAssetTag(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `MGY-${num}`;
}

export const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  deployed: '#3b82f6',
  in_storage: '#8b5cf6',
  under_repair: '#f59e0b',
  retired: '#6b7280',
  disposed: '#6b7280',
  sold: '#06b6d4',
  damaged: '#ef4444',
  lost: '#dc2626',
  pending: '#f59e0b',
  approved: '#3b82f6',
  in_transit: '#D4AF37',
  received: '#22c55e',
  completed: '#22c55e',
  rejected: '#ef4444',
  cancelled: '#6b7280',
  reported: '#ef4444',
  diagnosed: '#8b5cf6',
  awaiting_parts: '#f59e0b',
  in_progress: '#3b82f6',
};
