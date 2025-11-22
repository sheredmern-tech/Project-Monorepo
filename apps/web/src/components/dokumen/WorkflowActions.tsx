'use client';

import { useState } from 'react';
import { WorkflowStatus, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Archive,
} from 'lucide-react';
import { dokumenApi } from '@/lib/api/dokumen.api';
import { toast } from 'sonner';

interface WorkflowActionsProps {
  dokumenId: string;
  currentStatus: WorkflowStatus;
  userRole: UserRole;
  onSuccess?: () => void;
  variant?: 'default' | 'compact';
}

export function WorkflowActions({
  dokumenId,
  currentStatus,
  userRole,
  onSuccess,
  variant = 'default',
}: WorkflowActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [actionType, setActionType] = useState<'submit' | 'review' | 'approve' | 'archive' | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine available actions based on status and role
  const canSubmit =
    currentStatus === WorkflowStatus.DRAFT &&
    [UserRole.ADVOKAT, UserRole.PARALEGAL, UserRole.STAFF].includes(userRole);

  const canReview =
    currentStatus === WorkflowStatus.SUBMITTED &&
    [UserRole.ADMIN, UserRole.PARTNER].includes(userRole);

  const canApprove =
    currentStatus === WorkflowStatus.IN_REVIEW &&
    [UserRole.ADMIN, UserRole.PARTNER].includes(userRole);

  const canReject =
    currentStatus === WorkflowStatus.IN_REVIEW &&
    [UserRole.ADMIN, UserRole.PARTNER].includes(userRole);

  const canArchive = [UserRole.ADMIN, UserRole.PARTNER].includes(userRole);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await dokumenApi.submitDocument(dokumenId, notes);
      toast.success('Document submitted for review');
      setShowNotesDialog(false);
      setNotes('');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit document');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      setLoading(true);
      await dokumenApi.reviewDocument(dokumenId, notes);
      toast.success('Document moved to review');
      setShowNotesDialog(false);
      setNotes('');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start review');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await dokumenApi.approveDocument(dokumenId, notes);
      toast.success('Document approved');
      setShowNotesDialog(false);
      setNotes('');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve document');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      setLoading(true);
      await dokumenApi.rejectDocument(dokumenId, reason, notes);
      toast.success('Document rejected');
      setShowRejectDialog(false);
      setReason('');
      setNotes('');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject document');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);
      await dokumenApi.archiveDocument(dokumenId, reason, notes);
      toast.success('Document archived');
      setShowNotesDialog(false);
      setReason('');
      setNotes('');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to archive document');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    switch (actionType) {
      case 'submit':
        handleSubmit();
        break;
      case 'review':
        handleReview();
        break;
      case 'approve':
        handleApprove();
        break;
      case 'archive':
        handleArchive();
        break;
    }
  };

  const openNotesDialog = (type: 'submit' | 'review' | 'approve' | 'archive') => {
    setActionType(type);
    setShowNotesDialog(true);
  };

  if (variant === 'compact') {
    return (
      <>
        <div className="flex gap-2">
          {canSubmit && (
            <Button
              size="sm"
              onClick={() => openNotesDialog('submit')}
              className="flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              Submit
            </Button>
          )}

          {canReview && (
            <Button
              size="sm"
              onClick={() => openNotesDialog('review')}
              className="flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              Review
            </Button>
          )}

          {canApprove && (
            <Button
              size="sm"
              onClick={() => openNotesDialog('approve')}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-3 h-3" />
              Approve
            </Button>
          )}

          {canReject && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              className="flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Reject
            </Button>
          )}

          {canArchive && currentStatus !== WorkflowStatus.ARCHIVED && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openNotesDialog('archive')}
              className="flex items-center gap-1"
            >
              <Archive className="w-3 h-3" />
              Archive
            </Button>
          )}
        </div>

        {/* Notes Dialog */}
        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'submit' && 'Submit Document'}
                {actionType === 'review' && 'Start Review'}
                {actionType === 'approve' && 'Approve Document'}
                {actionType === 'archive' && 'Archive Document'}
              </DialogTitle>
              <DialogDescription>
                Add optional notes for this action
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {actionType === 'archive' && (
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why is this document being archived?"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNotesDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleAction} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Document</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejection
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-reason">Reason *</Label>
                <Textarea
                  id="reject-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this document being rejected?"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reject-notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="reject-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading || !reason.trim()}
              >
                {loading ? 'Rejecting...' : 'Reject Document'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}
