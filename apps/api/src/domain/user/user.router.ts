import { z } from "zod";
import { createRouter } from "../../util/trpcContext";

export const UserRouter = createRouter()
  .query("list", {
    async resolve({ ctx }) {
      const users = ctx.db.user.findMany();
      return users;
    },
  })
  .query("byId", {
    input: z.object({
      userId: z.string().uuid(),
    }),
    async resolve({ ctx, input: { userId } }) {
      const user = await ctx.db.user.findUnique({ where: { id: userId } });
      return user;
    },
  })
  .query("self", {
    async resolve({ ctx }) {
      const { userId } = ctx.req.session.data;

      const user = await ctx.db.user.findUnique({ where: { id: userId } });
      return user;
    },
  });
