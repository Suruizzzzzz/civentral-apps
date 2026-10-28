import { create } from 'zustand';
import {
  CitizenDashboardData,
  fetchCitizenDashboard,
} from '@/src/features/education/dashboard/api/scholarshipDashboardApi';

export interface ScholarshipStoreState {
  dashboardData: CitizenDashboardData | null;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: (force?: boolean) => Promise<CitizenDashboardData | null>;
  invalidate: () => void;
  updateLocalStatus: (recordId: number | string, newStatus: string) => void;
  setDashboardData: (data: CitizenDashboardData | null) => void;
  reset: () => void;
}

const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds TTL cache window

/**
 * Global Zustand store for Civentral scholarship dashboard data.
 * Eliminates duplicate fetches between Dashboard, Detail, and History screens
 * while respecting pull-to-refresh forced reloads.
 */
export const useScholarshipStore = create<ScholarshipStoreState>((set, get) => ({
  dashboardData: null,
  lastFetched: null,
  isLoading: false,
  error: null,

  fetchDashboard: async (force = false) => {
    const { dashboardData, lastFetched, isLoading } = get();
    const now = Date.now();

    // Prevent duplicate concurrent requests
    if (isLoading) {
      return dashboardData;
    }

    // Serve cached data if valid within TTL and not forced
    if (!force && dashboardData && lastFetched && (now - lastFetched < DEFAULT_TTL_MS)) {
      return dashboardData;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await fetchCitizenDashboard();
      set({
        dashboardData: data,
        lastFetched: Date.now(),
        isLoading: false,
        error: null,
      });
      return data;
    } catch (err: any) {
      const errorMsg = err?.message || 'Unable to retrieve Civentral scholarship dashboard information.';
      set({
        isLoading: false,
        error: errorMsg,
      });
      // Fallback gracefully to existing cache if available
      return get().dashboardData;
    }
  },

  invalidate: () => {
    set({ lastFetched: null });
  },

  updateLocalStatus: (recordId: number | string, newStatus: string) => {
    set((state) => {
      if (!state.dashboardData) return state;

      const updated = { ...state.dashboardData };
      const idNum = Number(recordId);

      // Optimistically update application status if matched
      if (
        updated.application &&
        (updated.application.application_id === idNum ||
          updated.application.application_code === String(recordId))
      ) {
        updated.application = {
          ...updated.application,
          application_status: newStatus,
        };
      }

      // Optimistically update grant status if matched
      if (
        updated.grant &&
        (updated.grant.grant_application_id === idNum ||
          updated.grant.grant_application_code === String(recordId))
      ) {
        updated.grant = {
          ...updated.grant,
          grant_status: newStatus,
          status: newStatus,
        };
      }

      // Optimistically update renewal status if matched
      if (
        updated.renewal &&
        (updated.renewal.renewal_id === idNum ||
          updated.renewal.renewal_code === String(recordId))
      ) {
        updated.renewal = {
          ...updated.renewal,
          renewal_status: newStatus,
        };
      }

      return { dashboardData: updated };
    });
  },

  setDashboardData: (data) => {
    set({ dashboardData: data, lastFetched: Date.now(), error: null });
  },

  reset: () => {
    set({
      dashboardData: null,
      lastFetched: null,
      isLoading: false,
      error: null,
    });
  },
}));
