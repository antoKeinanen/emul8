import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { initTrpcClient, trpc } from "../lib/trpc";
import AuthProvider from "../contexts/AuthProvider";

function RootRoute() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => initTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export const Route = createRootRoute({
  component: RootRoute,
});
