import {
  createTRPCProxyClient,
  createTRPCReact,
  httpBatchLink,
} from "@trpc/react-query";
import type { AuthRouter } from "@emul8/auth-service";
import { useAuthStore } from "../stores/auth";
import superjson from "superjson";

export const trpc = createTRPCReact<AuthRouter>();

let trpcClient: ReturnType<typeof createTRPCProxyClient<AuthRouter>>;

let refreshing: Promise<void> | null = null;
async function doRefresh() {
  refreshing ??= trpcClient.auth.refresh
    .mutate()
    .then(({ accessToken }) =>
      useAuthStore.getState().setAccessToken(accessToken),
    )
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.headers ?? []),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (res.status == 401) {
    try {
      await doRefresh();
    } catch {
      useAuthStore.getState().clearAuth();
      return new Response(null, { status: 401 });
    }

    const newToken = useAuthStore.getState().accessToken;

    return await fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.headers ?? []),
        Authorization: newToken ? `Bearer ${newToken}` : "",
      },
    });
  }

  return res;
}

export function initTrpcClient() {
  trpcClient = createTRPCProxyClient({
    links: [
      httpBatchLink({
        url: "/api/auth",
        fetch: fetchWithAuth,
        transformer: superjson,
      }),
    ],
  });

  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/auth",
        fetch: fetchWithAuth,
        transformer: superjson,
      }),
    ],
  });
}
