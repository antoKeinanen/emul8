import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "../lib/trpc";

function Index() {
  const { data, isLoading } = trpc.getHello.useQuery({ name: "World" });

  return <p>{isLoading ? "Loading..." : data}</p>;
}

export const Route = createFileRoute("/")({
  component: Index,
})
