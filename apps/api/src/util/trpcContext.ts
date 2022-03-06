import * as trpcFastify from "@trpc/server/adapters/fastify";
import { inferAsyncReturnType, router } from "@trpc/server";
import { getApplicationContext } from "../context/applicationContext";

export const createContext = async ({
  req,
  res,
}: trpcFastify.CreateFastifyContextOptions) => {
  const { prisma: db, config } = await getApplicationContext();

  return {
    req,
    res,
    db,
    config,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;

export function createRouter() {
  return router<Context>();
}
