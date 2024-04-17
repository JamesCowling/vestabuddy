import { v } from "convex/values";
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
} from "./_generated/server";
import { getLayout, setLayout, setMessage } from "./vesta";
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
    { scheduler, runQuery, runMutation },
    { message, duration, serviceAcctKey }
  ) => {
    // Have to comment out this check if we want to call from the python script.
    await runQuery(internal.auth.checkAuth, { serviceAcctKey });

    // Vestaboard rate-limits below 15 seconds.
    const delay = Math.max(Number(duration), 15);

    const current = await getLayout();
    runMutation(internal.board.pushResetter, { message: current });
    console.log(`setting vestaboard to ${message}`);
    await setMessage(message);
    console.log(`resetting vestaboard in ${delay} s`);
    await scheduler.runAfter(1000 * delay, internal.board.reset, {});
  },
});

export const reset = internalAction({
  args: {},
  handler: async ({ runMutation }, {}) => {
    const message = await runMutation(internal.board.popResetter, {});
    if (message !== null) {
      console.log(`resetting vestaboard to ${message}`);
      await setLayout(message);
    }
  },
});

/// Handle multiple messages before the delay period completes
export const pushResetter = internalMutation({
  args: { message: v.string() },
  handler: async ({ db }, { message }) => {
    const resetCounter = await db.query("resetCounter").unique();
    if (resetCounter === null) {
      await db.insert("resetCounter", { message, remainingResetters: 1 });
    } else {
      // There's a prior reset. Don't overwrite it, just bump the count.
      await db.patch(resetCounter._id, {
        remainingResetters: resetCounter.remainingResetters + 1,
      });
    }
  },
});

export const popResetter = internalMutation({
  args: {},
  handler: async ({ db }) => {
    const resetCounter = await db.query("resetCounter").unique();
    if (resetCounter === null) {
      throw new Error("popResetter called with nothing to reset to?");
    }
    if (resetCounter.remainingResetters === 0) {
      throw new Error("popResetter called with remaining resetters 0?");
    }
    if (resetCounter.remainingResetters === 1) {
      await db.delete(resetCounter._id);
      return resetCounter.message;
    } else {
      // There's more resets coming. Don't do it yet, just decr the count
      db.patch(resetCounter._id, {
        remainingResetters: resetCounter.remainingResetters - 1,
      });
      return null;
    }
  },
});
