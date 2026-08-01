import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authMe, authLogin, authLogout, authRegister } from '@/lib/api';
import type { User } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authMe();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const user = data?.user ?? null;

  const loginMutation = useMutation({
    mutationFn: (body: { email: string; password: string; rememberMe?: boolean }) =>
      authLogin(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authLogout,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const registerMutation = useMutation({
    mutationFn: (body: { name: string; email: string; phone?: string; password: string }) =>
      authRegister(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const login = useCallback(
    async (email: string, password: string, rememberMe?: boolean) => {
      await loginMutation.mutateAsync({ email, password, rememberMe });
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const register = useCallback(
    async (name: string, email: string, phone: string, password: string) => {
      await registerMutation.mutateAsync({ name, email, phone: phone || undefined, password });
    },
    [registerMutation],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, logout, register, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
