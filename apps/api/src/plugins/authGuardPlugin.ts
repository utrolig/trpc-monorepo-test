import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const plugin: FastifyPluginAsync = async (instance) => {
  instance.addHook("preHandler", async (request, reply) => {
    if (request.routerPath?.startsWith("/trpc/")) {
      if (!request.session.data.userId) {
        reply.status(401);
        request.log.info({
          path: request.url,
          msg: "Terminated unauthorized request",
        });
        return reply.send("Unauthorized");
      }
    }
  });
};

export const authGuardPlugin = fp(plugin);
