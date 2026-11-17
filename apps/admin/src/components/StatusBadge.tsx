import React from 'react';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

export type BadgeVariant =
  | 'COMPLETED'
  | 'UPCOMING'
  | 'IN_PROGRESS'
  | 'CANCELLED'
  | 'SEARCHING'
  | 'ASSIGNED'
  | 'VERIFIED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'CAPTURED'
  | 'REFUNDED'
  | 'FAILED'
  | 'ACTIVE'
  | 'INACTIVE';

interface StatusBadgeProps {
  status: string | BadgeVariant;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const normStatus = (status || '').toUpperCase().trim();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = status;
  let Icon = Clock;

  switch (normStatus) {
    // Green = Completed, Verified, Captured, Active
    case 'COMPLETED':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Completed';
      Icon = CheckCircle2;
      break;
    case 'VERIFIED':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Verified';
      Icon = ShieldCheck;
      break;
    case 'APPROVED':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Approved';
      Icon = CheckCircle2;
      break;
    case 'CAPTURED':
    case 'SUCCESS':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Captured';
      Icon = CheckCircle2;
      break;
    case 'ACTIVE':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Active';
      Icon = CheckCircle2;
      break;

    // Yellow / Amber = Upcoming, Pending
    case 'UPCOMING':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Upcoming';
      Icon = Clock;
      break;
    case 'PENDING':
    case 'SUBMITTED':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Pending Review';
      Icon = Clock;
      break;
    case 'ASSIGNED':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Assigned';
      Icon = Clock;
      break;
    case 'SEARCHING':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Searching Cook';
      Icon = Clock;
      break;

    // Blue = In-Progress, Under Review
    case 'IN_PROGRESS':
    case 'EN_ROUTE':
    case 'ARRIVED':
      styles = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'In Progress';
      Icon = PlayCircle;
      break;
    case 'UNDER_REVIEW':
      styles = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Under Review';
      Icon = AlertTriangle;
      break;

    // Red = Cancelled, Rejected, Failed
    case 'CANCELLED':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Cancelled';
      Icon = XCircle;
      break;
    case 'REJECTED':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Rejected';
      Icon = XCircle;
      break;
    case 'FAILED':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Failed';
      Icon = XCircle;
      break;

    // Purple / Muted = Refunded, Suspended, Inactive
    case 'REFUNDED':
      styles = 'bg-purple-50 text-purple-700 border-purple-200';
      label = 'Refunded';
      Icon = RotateCcw;
      break;
    case 'SUSPENDED':
      styles = 'bg-red-50 text-red-800 border-red-200';
      label = 'Suspended';
      Icon = ShieldAlert;
      break;
    case 'INACTIVE':
      styles = 'bg-gray-100 text-gray-500 border-gray-200';
      label = 'Inactive';
      Icon = Clock;
      break;

    default:
      styles = 'bg-gray-100 text-gray-700 border-gray-200';
      label = status;
      Icon = Clock;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses} ${styles} transition-colors`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
