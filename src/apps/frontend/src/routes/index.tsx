import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "../lib/trpc";
import { useAuthStore } from "../stores/auth";

function Index() {
  const { data, isLoading } = trpc.auth.debug.useQuery();
  const clearAuth = useAuthStore().clearAuth;
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      clearAuth();
    },
  });

  const handleLogout = async () => {
    await logout.mutateAsync();
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <p>{data}</p>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
});
