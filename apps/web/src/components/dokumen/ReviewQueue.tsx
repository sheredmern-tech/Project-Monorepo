'use client';

import { useEffect, useState } from 'react';
import { dokumenApi } from '@/lib/api/dokumen.api';
import { StatusBadge } from './StatusBadge';
import { WorkflowActions } from './WorkflowActions';
import { WorkflowStatus, UserRole } from '@/types';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReviewQueueProps {
  status?: WorkflowStatus;
  perkaraId?: string;
  userRole: UserRole;
}

export function ReviewQueue({ status, perkaraId, userRole }: ReviewQueueProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, [status, perkaraId]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (status) params.status = status;
      if (perkaraId) params.perkara_id = perkaraId;

      const response = await dokumenApi.getWorkflowQueue(params);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to load queue:', error);
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

  if (documents.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No documents in queue
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Perkara</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted By</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium">
              {doc.dokumen.nama_dokumen}
            </TableCell>
            <TableCell>
              {doc.dokumen.perkara.nomor_perkara}
            </TableCell>
            <TableCell>
              <StatusBadge status={doc.current_status} />
            </TableCell>
            <TableCell>
              {doc.submitter?.nama_lengkap || '-'}
            </TableCell>
            <TableCell>
              <WorkflowActions
                dokumenId={doc.dokumen_id}
                currentStatus={doc.current_status}
                userRole={userRole}
                onSuccess={loadQueue}
                variant="compact"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
