import fastify from "fastify";
import { authRoutes } from "./auth/authRoutes";
import { getApplicationContext } from "./context/applicationContext";
import { applicationContextPlugin } from "./plugins/applicationContextPlugin";
import { authGuardPlugin } from "./plugins/authGuardPlugin";
import { cors } from "./plugins/corsPlugin";
import { errorHandler } from "./plugins/errorHandler";
import { sessionPlugin } from "./plugins/sessionPlugin";
import { trpcPlugin } from "./plugins/trpcPlugin";

async function main() {
  const appCtx = await getApplicationContext();
  const { config } = appCtx;

  const server = fastify({ logger: appCtx.logger });

  server.register(errorHandler);
  server.register(applicationContextPlugin, { appCtx });
  server.register(sessionPlugin, {
    appCtx,
    cookieName: "app.sid",
    secretKey: appCtx.config.APPLICATION_SECRET,
    sessionKey: appCtx.config.SESSION_KEY,
    secure: config.PROD,
  });

  server.register(cors, {
    origins: config.CORS_ORIGINS.split(","),
  });

  server.register(authGuardPlugin);
  server.register(trpcPlugin, { routePrefix: "/trpc" });
  server.register(authRoutes, { routePrefix: "/api/auth" });

  try {
    await server.listen(config.PORT);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
