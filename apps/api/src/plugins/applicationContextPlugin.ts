import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ApplicationContext } from "../context/applicationContext";

export type ApplicationContextPluginOptions = {
  appCtx: ApplicationContext;
};

declare module "fastify" {
  export interface FastifyInstance {
    appCtx: ApplicationContext;
  }
}

const plugin: FastifyPluginAsync<ApplicationContextPluginOptions> = async (
  instance,
  { appCtx }
) => {
  instance.log.info("Setting up applicationContext");
  instance.decorate("appCtx", appCtx);
};

export const applicationContextPlugin = fp(plugin);
