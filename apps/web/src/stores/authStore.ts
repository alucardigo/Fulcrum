import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define UserRole enum - ideally this would come from @fulcrum/shared if available there
// Using roles consistent with backend (Prisma schema, CASL factory)
export enum UserRole {
  SOLICITANTE = 'SOLICITANTE',
  COMPRAS = 'COMPRAS',
  GERENCIA = 'GERENCIA',
  ADMINISTRADOR = 'ADMINISTRADOR',
  // Add any other roles if necessary, or a general 'USER' role if applicable
}

export interface AuthUser {
  id: string; // Changed idUsuario to id for consistency with backend User model
  email: string;
  firstName?: string; // Optional: from previous User type in shared
  lastName?: string;  // Optional
  roles: { role: UserRole }[]; // Array of roles, matching structure from backend User model's 'roles' relation
}

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean; // Renamed from estaAutenticado for common convention
  user: AuthUser | null;    // Renamed from usuario and using new AuthUser type
  isLoading: boolean; // Added for async auth operations like fetching user profile
  setAuthentication: (token: string, userData: AuthUser) => void; // Renamed and updated signature
  clearAuthentication: () => void; // Renamed
  setIsLoading: (loading: boolean) => void;
  // Potentially add a function to fetch user profile if not all data comes with login
  // fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      isAuthenticated: false,
      user: null,
      isLoading: true, // Start as true until initial auth check is done (e.g. on app load)

      setAuthentication: (token, userData) => {
        set({
          accessToken: token,
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
        // Potentially trigger other actions upon authentication
      },

      clearAuthentication: () => {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        // Here you might also want to clear other user-related persisted state
        // e.g., useRequestStore.getState().clearUserRequests();
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      // Example: if you need to fetch user profile separately after login or on app load
      // fetchUserProfile: async () => {
      //   if (!get().accessToken) {
      //     set({ isLoading: false, isAuthenticated: false, user: null });
      //     return;
      //   }
      //   set({ isLoading: true });
      //   try {
      //     // const response = await apiClient.get('/auth/me'); // Or your profile endpoint
      //     // const userData = response.data as AuthUser;
      //     // set({ user: userData, isAuthenticated: true, isLoading: false });
      //
      //     // For now, if token exists, assume user is loaded from persist or initial login
      //     // This part needs to be robust depending on your actual auth flow
      //     if (get().user) { // If user was persisted
      //        set({ isLoading: false, isAuthenticated: true });
      //     } else { // No user persisted, but token exists - might be an invalid state or needs fetch
      //        console.warn("Token exists but no user data, consider fetching profile or clearing auth");
      //        get().clearAuthentication(); // Or attempt to fetch profile
      //     }
      //   } catch (error) {
      //     console.error("Failed to fetch user profile", error);
      //     get().clearAuthentication(); // Clear auth on error
      //   }
      // },
    }),
    {
      name: 'fulcrum-auth-storage', // Updated storage key name
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        console.log("AuthStore: Hydration starting...");
        return (hydratedState, error) => {
          if (error) {
            console.error("AuthStore: An error occurred during hydration:", error);
          } else {
            console.log("AuthStore: Hydration finished.", hydratedState);
            // Initially, after hydration, if a token exists, we might still be "loading"
            // until we verify the token or fetch fresh user data.
            // For simplicity here, if a user is hydrated, we set loading to false.
            if (hydratedState?.user) {
              useAuthStore.getState().setIsLoading(false);
              useAuthStore.getState().setAuthentication(hydratedState.accessToken!, hydratedState.user);
            } else {
               useAuthStore.getState().setIsLoading(false); // No user, so not loading auth data.
            }
          }
        };
      }
    }
  )
);

// Call this on app initialization (e.g., in your main layout or _app.tsx)
// if (typeof window !== 'undefined') {
//   useAuthStore.getState().fetchUserProfile(); // Or some other initial auth check
// }
// For now, setting isLoading to false initially if no token/user from storage
if (typeof window !== 'undefined' && !useAuthStore.getState().accessToken) {
    useAuthStore.getState().setIsLoading(false);
}
