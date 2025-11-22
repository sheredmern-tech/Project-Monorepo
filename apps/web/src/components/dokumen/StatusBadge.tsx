'use client';

import { WorkflowStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Archive,
} from 'lucide-react';

interface StatusBadgeProps {
  status: WorkflowStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  WorkflowStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ElementType;
    className: string;
  }
> = {
  [WorkflowStatus.DRAFT]: {
    label: 'Draft',
    variant: 'outline',
    icon: FileText,
    className: 'border-gray-300 text-gray-700',
  },
  [WorkflowStatus.SUBMITTED]: {
    label: 'Submitted',
    variant: 'default',
    icon: Send,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  [WorkflowStatus.IN_REVIEW]: {
    label: 'In Review',
    variant: 'secondary',
    icon: Eye,
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  },
  [WorkflowStatus.APPROVED]: {
    label: 'Approved',
    variant: 'default',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
  [WorkflowStatus.REJECTED]: {
    label: 'Rejected',
    variant: 'destructive',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
  [WorkflowStatus.ARCHIVED]: {
    label: 'Archived',
    variant: 'outline',
    icon: Archive,
    className: 'border-gray-400 text-gray-600',
  },
};

export function StatusBadge({
  status,
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
