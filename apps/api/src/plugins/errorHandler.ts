import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const plugin: FastifyPluginAsync = async (instance) => {
  instance.log.info("Setting up errorhandler");
  instance.setErrorHandler(async (error, _request, reply) => {
    instance.log.error(error);
    return reply
      .status(500)
      .send({ statusCode: 500, error: "Internal server error." });
  });
};

export const errorHandler = fp(plugin);
