import { z } from "zod";
import { createSingleton } from "../util/createSingleton";

enum NodeEnv {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

export enum LogLevel {
  FATAL = "fatal",
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
  SILENT = "silent",
}

const EnvSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.preprocess(Number, z.number()),
  APPLICATION_SECRET: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  LOG_LEVEL: z.nativeEnum(LogLevel),
  SESSION_KEY: z.string(),
  SERVER_URL: z.string(),
  CORS_ORIGINS: z.string(),
});

type EnvSchema = z.infer<typeof EnvSchema>;

export type ApplicationConfig = EnvSchema & {
  DEV: boolean;
  PROD: boolean;
};

export const getConfig = createSingleton(
  async function createApplicationConfig() {
    if (process.env.NODE_ENV === "development") {
      return import("dotenv").then(async ({ config: dotenvConfig }) => {
        const output = dotenvConfig();

        const env = {
          ...output.parsed,
          NODE_ENV: process.env.NODE_ENV,
        };
        const parsed = await EnvSchema.parseAsync(env);

        const config = {
          ...parsed,
          DEV: parsed.NODE_ENV === NodeEnv.DEVELOPMENT,
          PROD: parsed.NODE_ENV === NodeEnv.PRODUCTION,
        };

        return config;
      });
    } else {
      const parsed = await EnvSchema.parseAsync(process.env);
      const config = {
        ...parsed,
        DEV: parsed.NODE_ENV === NodeEnv.DEVELOPMENT,
        PROD: parsed.NODE_ENV === NodeEnv.PRODUCTION,
      };

      return config;
    }
  }
);
