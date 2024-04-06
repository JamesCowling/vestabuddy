import { v } from "convex/values";
import { action, httpAction, internalAction } from "./_generated/server";
import { getVesta, setVesta, setVestaString } from "./vesta";
import { api, internal } from "./_generated/api";

export const postHttp = httpAction(async (ctx, request) => {
  const { message, duration, serviceAcctKey } = await request.json();

  await ctx.runAction(api.board.post, { message, duration, serviceAcctKey });

  return new Response(null, {
    status: 200,
  });
});

export const post = action({
  args: {
    message: v.string(),
    duration: v.float64(),
    serviceAcctKey: v.optional(v.string()),
  },
  handler: async (
    { scheduler, runQuery },
    { message, duration, serviceAcctKey }
  ) => {
    // Have to comment out this check if we want to call from the python script.
    await runQuery(internal.auth.checkAuth, { serviceAcctKey });

    // Vestaboard rate-limits below 15 seconds.
    const delay = Math.max(Number(duration), 15);

    const current = await getVesta();
    console.log("setting vestaboard to %s", message);
    await setVestaString(message);
    console.log("resetting vestaboard in %d s", delay);
    await scheduler.runAfter(1000 * delay, internal.board.reset, {
      text: current,
    });
  },
});

export const reset = internalAction({
  args: { text: v.string() },
  handler: async ({}, { text }) => {
    console.log("resetting vestaboard to %s", text);
    await setVesta(text);
  },
});
