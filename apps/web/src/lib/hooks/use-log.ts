// ============================================================================
// FILE: lib/hooks/use-log.ts - NEW HOOK FOR LOG AKTIVITAS
// ============================================================================
"use client";

import { useCallback, useState } from "react";
import { logApi } from "@/lib/api/log.api";
import { 
  LogAktivitasWithUser,
  QueryLogAktivitasDto,
  PaginatedResponse
} from "@/types";
import { handleApiError, getErrorMessage } from "@/lib/utils/error-handler";

export function useLog() {
  // State
  const [logs, setLogs] = useState<LogAktivitasWithUser[]>([]);
  const [myLogs, setMyLogs] = useState<LogAktivitasWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all activity logs (Admin only)
   */
  const fetchLogs = useCallback(async (params?: QueryLogAktivitasDto): Promise<PaginatedResponse<LogAktivitasWithUser>> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await logApi.getAll(params);
      setLogs(response.data);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat log aktivitas");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch my activity logs (Current user only)
   */
  const fetchMyActivity = useCallback(async (params?: QueryLogAktivitasDto): Promise<PaginatedResponse<LogAktivitasWithUser>> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await logApi.getMyActivity(params);
      setMyLogs(response.data);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      handleApiError(err, "Gagal memuat aktivitas saya");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Filter logs by entity type
   */
  const filterByEntity = useCallback((logs: LogAktivitasWithUser[], entityType: string): LogAktivitasWithUser[] => {
    return logs.filter(log => log.jenis_entitas === entityType);
  }, []);

  /**
   * Filter logs by action
   */
  const filterByAction = useCallback((logs: LogAktivitasWithUser[], action: string): LogAktivitasWithUser[] => {
    return logs.filter(log => log.aksi === action);
  }, []);

  /**
   * Filter logs by user
   */
  const filterByUser = useCallback((logs: LogAktivitasWithUser[], userId: string): LogAktivitasWithUser[] => {
    return logs.filter(log => log.user_id === userId);
  }, []);

  /**
   * Group logs by date
   */
  const groupByDate = useCallback((logs: LogAktivitasWithUser[]): Record<string, LogAktivitasWithUser[]> => {
    return logs.reduce((acc, log) => {
      const date = new Date(log.created_at).toLocaleDateString('id-ID');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {} as Record<string, LogAktivitasWithUser[]>);
  }, []);

  /**
   * Get recent logs (last N items)
   */
  const getRecentLogs = useCallback((logs: LogAktivitasWithUser[], count: number = 10): LogAktivitasWithUser[] => {
    return logs.slice(0, count);
  }, []);

  return {
    // State
    logs,
    myLogs,
    isLoading,
    error,
    
    // Actions
    fetchLogs,
    fetchMyActivity,
    
    // Utilities
    filterByEntity,
    filterByAction,
    filterByUser,
    groupByDate,
    getRecentLogs,
  };
}