import { FastifyPluginAsync } from "fastify";
import {
  createRedirectUrl,
  exchangeCodeForToken,
  parseBase64UrlState,
  toBase64UrlState,
} from "./util";
import urljoin from "url-join";
import fp from "fastify-plugin";

export type LoginCallbackState = {
  from: string;
};

export type AuthRouterOptions = {
  routePrefix: string;
};

const plugin: FastifyPluginAsync<AuthRouterOptions> = async (
  instance,
  { routePrefix }
) => {
  instance.get<{
    Querystring: {
      from: string;
    };
  }>(
    urljoin(routePrefix, "/logout"),
    {
      schema: {
        querystring: {
          from: {
            type: "string",
          },
        },
      },
    },
    async function (request, reply) {
      if (request.query.from) {
        try {
          if (request.session.data.userId) {
            await this.appCtx.prisma.userCredentials.delete({
              where: { userId: request.session.data.userId },
            });
          }

          await request.destroySession();

          const decoded = decodeURI(request.query.from);
          return reply.redirect(decoded);
        } catch (err) {
          request.log.warn({
            msg: "Error while decoding URI in from field",
            query: request.query,
          });
          const referer = request.headers.referer;

          if (!referer) {
            return {
              message:
                "You were logged out, but we were unable to find a redirection path.",
            };
          }

          return reply.redirect(referer);
        }
      }

      return {
        lol: "ok",
      };
    }
  );

  instance.get<{ Querystring: { from: string } }>(
    urljoin(routePrefix, "/discord/login"),
    {
      schema: {
        querystring: {
          from: {
            type: "string",
          },
        },
      },
    },
    async function (request, reply) {
      const { DISCORD_CLIENT_ID: client_id, SERVER_URL } = this.appCtx.config;
      const redirect_uri = urljoin(
        SERVER_URL,
        routePrefix,
        "/discord/callback"
      );
      const response_type = "code";
      const scope = "identify";

      const state = toBase64UrlState({ from: request.query.from });

      const sp = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type,
        scope,
        state,
      });

      const redirectUrl = `https://discord.com/api/oauth2/authorize?${sp.toString()}`;
      return reply.redirect(redirectUrl);
    }
  );

  instance.get<{ Querystring: { code: string; state: string } }>(
    urljoin(routePrefix, "/discord/callback"),
    {
      schema: {
        querystring: {
          state: {
            type: "string",
          },
          code: {
            type: "string",
          },
        },
      },
    },
    async function (request, reply) {
      const { appCtx } = this;
      const { config, prisma } = appCtx;
      const { code, state } = request.query;

      const parsedState = parseBase64UrlState<{ from: string }>(state);

      const redirectUrl = createRedirectUrl(
        config,
        "/api/auth/discord/callback"
      );

      const userData = await exchangeCodeForToken({
        client_id: config.DISCORD_CLIENT_ID,
        client_secret: config.DISCORD_CLIENT_SECRET,
        code,
        redirect_uri: redirectUrl,
      });

      const credentials = await prisma.userCredentials.findFirst({
        where: { discordId: userData.profile.id },
      });

      if (!credentials) {
        const user = await prisma.user.create({
          data: {
            name: userData.profile.username,
            credentials: {
              create: {
                discordId: userData.profile.id,
                accessToken: userData.access_token,
                refreshToken: userData.refresh_token,
                expiresAt: new Date(userData.expires_in * 1000 + Date.now()),
              },
            },
          },
          include: {
            credentials: true,
          },
        });

        request.session.set("userId", user.id);

        return reply.redirect(parsedState.from);
      }

      const user = await prisma.user.update({
        where: { id: credentials.userId },
        data: {
          credentials: {
            update: {
              discordId: userData.profile.id,
              accessToken: userData.access_token,
              refreshToken: userData.refresh_token,
              expiresAt: new Date(userData.expires_in * 1000 + Date.now()),
            },
          },
        },
        include: { credentials: true },
      });

      request.session.set("userId", user.id);

      return reply.redirect(parsedState.from);
    }
  );
};

export const authRoutes = fp(plugin);
