import { FastifyPluginAsync } from "fastify";
import { ApplicationContext } from "../context/applicationContext";
import fastifyCookie from "fastify-cookie";
import PrismaStore from "@mgcrea/fastify-session-prisma-store";
import fastifySession, { Session } from "@mgcrea/fastify-session";
import { SODIUM_AUTH } from "@mgcrea/fastify-session-sodium-crypto";
import fp from "fastify-plugin";

const SESSION_TTL = 86400 * 30; // 30 days

declare module "fastify" {
  interface FastifyRequest {
    session: Session;
    destroySession: () => Promise<void>;
  }
}

declare module "@mgcrea/fastify-session" {
  interface SessionData {
    userId: string;
  }
}

export type SessionPluginOptions = {
  appCtx: ApplicationContext;
  sessionKey: string;
  cookieName: string;
  secretKey: string;
  secure: boolean;
};

const plugin: FastifyPluginAsync<SessionPluginOptions> = async (
  instance,
  options
) => {
  instance.register(fastifyCookie);

  const { secretKey, sessionKey, secure, appCtx } = options;
  const cookieName = "test.app.sid";

  instance.log.info({
    cookieName,
    secure,
    msg: "Registering session middleware",
  });
  instance.register(fastifySession, {
    secret: secretKey,
    key: Buffer.from(sessionKey, "base64"),
    crypto: SODIUM_AUTH,
    cookieName,
    cookie: { secure, maxAge: SESSION_TTL },
    saveUninitialized: false,
    store: new PrismaStore({ prisma: appCtx.prisma }),
  });
};

export const sessionPlugin = fp(plugin);
