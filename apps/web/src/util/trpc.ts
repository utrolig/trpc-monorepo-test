import { createReactQueryHooks } from "@trpc/react";
import type { AppRouter } from "@demoapp/api";

export const trpc = createReactQueryHooks<AppRouter>();
