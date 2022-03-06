import { getFetch } from "@trpc/client";
import { useState, VFC } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import { trpc } from "./util/trpc";
import { UnauthorizedError } from "./util/UnauthorizedError";

export const Root: VFC = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: "http://localhost:4000/trpc",
      fetch: async (url, options) => {
        const fetch = getFetch();
        const response = await fetch(url, {
          ...options,
          credentials: "include",
        });

        if (response.status === 401) {
          throw new UnauthorizedError();
        }

        return response;
      },
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
