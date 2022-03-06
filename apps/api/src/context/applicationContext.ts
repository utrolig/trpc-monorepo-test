import { ApplicationConfig, getConfig, LogLevel } from "../config";
import { PrismaClient, Prisma } from "@prisma/client";
import { createSingleton } from "../util/createSingleton";
import logger, { Logger } from "pino";

export type ApplicationContext = {
  config: ApplicationConfig;
  prisma: PrismaClient;
  logger: Logger;
};

const createLogger = (dev: boolean, level: LogLevel) => {
  if (dev) {
    return logger({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          ignore: "hostname,pid",
        },
      },
      timestamp: logger.stdTimeFunctions.isoTime,
      level,
    });
  }

  return logger({ level });
};

const getLogLevels = (dev: boolean): Prisma.LogDefinition[] => {
  const devLevels = ["warn", "info", "error", "query"] as Prisma.LogLevel[];
  const prodLevels = ["error"] as Prisma.LogLevel[];

  const toEmitEvent = (level: Prisma.LogLevel) =>
    ({ level, emit: "event" as const } as Prisma.LogDefinition);

  if (dev) {
    return devLevels.map(toEmitEvent);
  }

  return prodLevels.map(toEmitEvent);
};

const isLogEvent = (e: unknown): e is Prisma.LogEvent => {
  if ((e as unknown as Prisma.LogEvent)?.message) {
    return true;
  }

  return false;
};

export const getApplicationContext = createSingleton(
  async function createApplicationContext(): Promise<ApplicationContext> {
    const config = await getConfig();

    const logger = createLogger(config.DEV, config.LOG_LEVEL);

    const logLevels = getLogLevels(config.DEV);

    const prisma = new PrismaClient({ log: logLevels });

    logLevels.forEach((loglevel) => {
      switch (loglevel.level) {
        case "error": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return prisma.$on("error" as any, (e) => {
            if (isLogEvent(e)) {
              const { message, ...rest } = e;
              logger.error({ msg: message, ...rest });
            } else {
              logger.error(e);
            }
          });
        }

        case "info": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return prisma.$on("info" as any, (e) => {
            if (isLogEvent(e)) {
              const { message, ...rest } = e;
              logger.info({ msg: message, ...rest });
            } else {
              logger.info(e);
            }
          });
        }

        case "query": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return prisma.$on("query" as any, (e) => {
            if (isLogEvent(e)) {
              const { message, ...rest } = e;
              logger.debug({ msg: message, ...rest });
            } else {
              logger.debug(e);
            }
          });
        }

        case "warn": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return prisma.$on("warn" as any, (e) => {
            if (isLogEvent(e)) {
              const { message, ...rest } = e;
              logger.warn({ msg: message, ...rest });
            } else {
              logger.warn(e);
            }
          });
        }
      }
    });

    await prisma.$connect();

    return {
      config,
      prisma,
      logger,
    };
  }
);
