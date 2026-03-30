'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import type { User } from '@/types'

function parseJWT(token: string): User | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload)) as User
  } catch {
    return null
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<{
    user: User | null;
    loading: boolean;
  }>({
    user: null,
    loading: true,
  });

  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      let currentUser: User | null = null;

      if (token) {
        const parsed = parseJWT(token);
        if (parsed && parsed.exp * 1000 > Date.now()) {
          currentUser = parsed;
        } else {
          localStorage.removeItem('token');
        }
      }

      setAuthState({ user: currentUser, loading: false });
    };

    initializeAuth();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; role: string }>(
      '/api/auth/login',
      { email, password }
    )
    localStorage.setItem('token', res.token)
    const parsed = parseJWT(res.token)
    setAuthState({ user: parsed, loading: false })
    router.push('/dashboard')
  }

  function logout() {
    localStorage.removeItem('token')
    setAuthState({ user: null, loading: false })
    router.push('/login')
  }

  return { user: authState.user, loading: authState.loading, login, logout }
}