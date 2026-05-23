import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApi } from "@/api/auth";
import type { UserPublic } from "@/api/types";
import { clearTokens, getToken, saveTokens } from "@/utils/storage";

interface AuthState {
  user: UserPublic | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) await refresh();
      setInitializing(false);
    })();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    await saveTokens(tokens);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const tokens = await authApi.register(email, password, fullName);
    await saveTokens(tokens);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const signOut = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, initializing, signIn, signUp, signOut, refresh }),
    [user, initializing, signIn, signUp, signOut, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
