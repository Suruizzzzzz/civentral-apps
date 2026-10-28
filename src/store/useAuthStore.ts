import { create } from 'zustand';
import { AuthService } from '@/src/services/auth-service';
import { CitizenUser } from '@/src/types/citizen';

export interface AuthState {
  token: string | null;
  citizenId: number | null;
  userProfile: CitizenUser | any | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initializeAuth: () => Promise<boolean>;
  setSession: (params: {
    token: string;
    citizenId: number;
    userProfile?: any;
    email?: string;
    phone?: string;
    expires_at?: string | number | null;
  }) => Promise<void>;
  setUserProfile: (profile: any) => void;
  syncFromAuthService: () => void;
  logout: () => Promise<void>;
}

/**
 * Global Zustand store for Civentral citizen authentication state.
 * Syncs reactively with AuthService and SecureStore persistence.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  citizenId: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: false,

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const restored = await AuthService.restoreSession();
      if (restored) {
        const u = AuthService.getCurrentUser();
        const hasSession = Boolean(u.token && u.citizen_user_id);
        set({
          token: hasSession ? u.token : null,
          citizenId: hasSession ? u.citizen_user_id : null,
          userProfile: hasSession ? u.user : null,
          isAuthenticated: hasSession,
          isLoading: false,
        });
        return hasSession;
      } else {
        set({
          token: null,
          citizenId: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return false;
      }
    } catch (err) {
      console.warn('[useAuthStore] initializeAuth error:', err);
      set({
        token: null,
        citizenId: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    }
  },

  setSession: async ({ token, citizenId, userProfile, email, phone, expires_at }) => {
    AuthService.setCurrentUser({
      token,
      citizen_user_id: citizenId,
      user: userProfile,
      email: email || userProfile?.email,
      phone: phone || userProfile?.mobile_number || userProfile?.phone,
    });

    await AuthService.saveSession({
      token,
      citizen_user_id: citizenId,
      email: email || userProfile?.email,
      expires_at,
    });

    set({
      token,
      citizenId,
      userProfile: userProfile || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUserProfile: (profile: any) => {
    set({ userProfile: profile });
  },

  syncFromAuthService: () => {
    const u = AuthService.getCurrentUser();
    const isAuth = !u.isGuest && Boolean(u.token && u.citizen_user_id);
    set({
      token: isAuth ? u.token : null,
      citizenId: isAuth ? u.citizen_user_id : null,
      userProfile: isAuth ? u.user : null,
      isAuthenticated: isAuth,
      isLoading: false,
    });
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.clearSession();
    } finally {
      set({
        token: null,
        citizenId: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

// Initialize sync listener from AuthService for single-flight 401 handling
AuthService.setUnauthorizedListener(() => {
  useAuthStore.getState().syncFromAuthService();
});
