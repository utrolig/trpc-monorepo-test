import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { createContext, Context } from "../util/trpcContext";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import * as trpc from "@trpc/server";
import { UserRouter } from "../domain/user/user.router";
import fp from "fastify-plugin";

export type TrpcPluginOptions = {
  routePrefix: string;
};

export const createAppRouter = () => {
  const appRouter = trpc.router<Context>().merge("user.", UserRouter);
  return appRouter;
};

export type AppRouter = ReturnType<typeof createAppRouter>;

const plugin: FastifyPluginAsync<TrpcPluginOptions> = async (
  instance,
  { routePrefix }
) => {
  const appRouter = createAppRouter();

  instance.register(fastifyPlugin(fastifyTRPCPlugin), {
    prefix: routePrefix,
    trpcOptions: { router: appRouter, createContext },
  });
};

export const trpcPlugin = fp(plugin);
