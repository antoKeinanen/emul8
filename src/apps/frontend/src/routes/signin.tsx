import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../stores/auth";
import type { FormEvent } from "react";
import { trpc } from "../lib/trpc";

function SignIn() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const navigate = useNavigate();

  const login = trpc.auth.signIn.useMutation({
    onSuccess: async (data) => {
      setAccessToken(data.accessToken);
      await navigate({ to: "/" });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    login.mutate({ username, password });
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" name="username" id="username" />
      <input type="password" name="password" id="password" />
      <input type="submit" value="login" />
    </form>
  );
}

export const Route = createFileRoute("/signin")({ component: SignIn });
