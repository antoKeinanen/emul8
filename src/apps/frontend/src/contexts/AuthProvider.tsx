import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "../stores/auth";
import { trpc } from "../lib/trpc";

function AuthProvider({ children }: { children: ReactNode }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const refresh = trpc.auth.refresh.useMutation({
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
    },
    onError: () => {
      clearAuth();
    },
  });

  useEffect(() => {
    if (!useAuthStore.getState().accessToken) {
      refresh.mutate();
    }
  }, []);

  return <>{children}</>;
}

export default AuthProvider;
