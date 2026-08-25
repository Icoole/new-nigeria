import { createServerFn } from "@tanstack/react-start";

export const getRumSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchRumSnapshot } = await import("./rum.server");
  return fetchRumSnapshot();
});

export const searchRumPus = createServerFn({ method: "GET" })
  .inputValidator((query: string) => String(query ?? ""))
  .handler(async ({ data: query }) => {
    const { searchPus } = await import("./rum.server");
    return searchPus(query);
  });
