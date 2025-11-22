'use client';

import { useEffect, useState } from 'react';
import { dokumenApi } from '@/lib/api/dokumen.api';
import { StatusBadge } from './StatusBadge';
import { WorkflowStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { id as indonesian } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface AuditLogProps {
  dokumenId: string;
}

interface AuditEntry {
  id: string;
  from_status: WorkflowStatus | null;
  to_status: WorkflowStatus;
  changed_by: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
  user: {
    id: string;
    nama_lengkap: string;
    email: string;
    role: string;
  } | null;
}

export function AuditLog({ dokumenId }: AuditLogProps) {
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [dokumenId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await dokumenApi.getDocumentHistory(dokumenId);
      // API client auto-unwraps response.data, so data is already the array
      setHistory(data as unknown as AuditEntry[]);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No status changes recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {entry.from_status && (
                <>
                  <StatusBadge status={entry.from_status} showIcon={false} />
                  <span className="text-gray-400">→</span>
                </>
              )}
              <StatusBadge status={entry.to_status} />
            </div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(entry.created_at), {
                addSuffix: true,
                locale: indonesian,
              })}
            </span>
          </div>

          {entry.user && (
            <div className="text-sm text-gray-600 mb-2">
              By: <span className="font-medium">{entry.user.nama_lengkap}</span>
              {' '}({entry.user.role})
            </div>
          )}

          {entry.reason && (
            <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
              <span className="font-medium text-yellow-800">Reason:</span>
              <span className="text-yellow-700 ml-1">{entry.reason}</span>
            </div>
          )}

          {entry.notes && (
            <div className="text-sm text-gray-600 italic">
              Note: {entry.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
