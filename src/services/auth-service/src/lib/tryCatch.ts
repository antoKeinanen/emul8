import type { Result } from "@emul8/types";

export function tryCatch<V, E>(mayThrow: () => V): Result<V, E> {
  try {
    const value = mayThrow();
    return [value, null];
  } catch (error) {
    return [null, error as E];
  }
}

export async function tryCatchAsync<V, E>(
  mayThrow: () => Promise<V>,
): Promise<Result<Awaited<V>, E>> {
  try {
    const value = await mayThrow();
    return [value, null];
  } catch (error) {
    return [null, error as E];
  }
}
