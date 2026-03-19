import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";
import { useFirebaseAuth, isFirebaseConfigured } from "@/hooks/useFirebaseAuth";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } =
    options ?? {};
  const resolvedRedirectPath = redirectPath ?? getLoginUrl();

  // Firebase auth (used when Firebase is configured)
  const firebase = useFirebaseAuth();

  // If Firebase is configured, use Firebase Auth entirely
  if (isFirebaseConfigured) {
    return {
      user: firebase.user,
      loading: firebase.loading,
      error: firebase.error,
      isAuthenticated: firebase.isAuthenticated,
      refresh: firebase.refresh,
      logout: firebase.logout,
      login: firebase.login,
    };
  }

  // Otherwise, fall back to original tRPC / OAuth auth
  return useTrpcAuth({ redirectOnUnauthenticated, redirectPath: resolvedRedirectPath });
}

/** Original tRPC-based auth (Manus OAuth) */
function useTrpcAuth(options: { redirectOnUnauthenticated: boolean; redirectPath: string }) {
  const { redirectOnUnauthenticated, redirectPath: resolvedRedirectPath } = options;
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === resolvedRedirectPath) return;

    window.location.href = resolvedRedirectPath
  }, [
    redirectOnUnauthenticated,
    resolvedRedirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
