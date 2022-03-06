import { FastifyPluginAsync } from "fastify";
import fastifyCors from "fastify-cors";
import fp from "fastify-plugin";

export type CorsPluginOptions = {
  origins: string[];
};

const plugin: FastifyPluginAsync<CorsPluginOptions> = async (
  instance,
  options
) => {
  instance.log.info({ msg: `Setting up cors`, origin: options.origins });
  instance.register(fastifyCors, {
    credentials: true,
    origin: options.origins,
  });
};

export const cors = fp(plugin);
