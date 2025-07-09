import { trpc } from "../lib/trpc";

function IndexPage() {
  const { data, isLoading } = trpc.getHello.useQuery({ name: "World" });

  return (<p>{isLoading ? "Loading..." : data}</p>);
}

export default IndexPage;