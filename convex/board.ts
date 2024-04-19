// Functions for posting messages to the Vestaboard.

import { v } from "convex/values";
import {
  httpAction,
  mutation,
  internalAction,
  internalMutation,
} from "./_generated/server";
import { getLayout, setLayout, setMessage } from "./vesta";
import { api, internal } from "./_generated/api";
import { checkAuth, checkServiceKey } from "./auth";

/// Call post via HTTP.
export const postHttp = httpAction(async (ctx, request) => {
  const { message, duration, serviceKey } = await request.json();
  await ctx.runMutation(api.board.post, { message, duration, serviceKey });
  return new Response(null, {
    status: 200,
  });
});

/// Post a message to the Vestaboard for the given duration. An optional
/// serviceKey can be used to authenticate the caller if not logged in via web.
export const post = mutation({
  args: {
    message: v.string(),
    duration: v.float64(),
    serviceKey: v.optional(v.string()),
  },
  handler: async (ctx, { message, duration, serviceKey }) => {
    if (serviceKey) {
      await checkServiceKey(ctx.db, serviceKey);
    } else {
      await checkAuth(ctx.auth);
    }
    await ctx.scheduler.runAfter(0, internal.board.postAuthed, {
      message,
      duration,
    });
  },
});

// Pre-authorized version of post.
export const postAuthed = internalAction({
  args: {
    message: v.string(),
    duration: v.float64(),
  },
  handler: async (ctx, { message, duration }) => {
    const delay = Math.max(Number(duration), 15); // Max rate on Vestaboard.
    const currentLayout = await getLayout();
    await ctx.runMutation(internal.board.scheduleReset, {
      currentLayout,
      delay,
    });
    await setMessage(message);
  },
});

// Record the current layout and schedule a reset to it after a delay.
// This works with multiple concurrent temporary messages.
export const scheduleReset = internalMutation({
  args: { currentLayout: v.string(), delay: v.float64() },
  handler: async (ctx, { currentLayout, delay }) => {
    // Record current state so we can reset to it later.
    const resetBuffer = await ctx.db.query("resetBuffer").unique();
    if (resetBuffer === null) {
      await ctx.db.insert("resetBuffer", {
        originalLayout: currentLayout,
        pendingResets: 1,
      });
    } else {
      // If there is a prior message awaiting reset then we don't overwrite it.
      await ctx.db.patch(resetBuffer._id, {
        pendingResets: resetBuffer.pendingResets + 1,
      });
    }
    console.log(`scheduling resetIfNeeded() in ${delay}s`);
    await ctx.scheduler.runAfter(
      1000 * delay,
      internal.board.resetIfNeeded,
      {}
    );
  },
});

// Resets the layout if this is the last remaining temporary message.
export const resetIfNeeded = internalMutation({
  handler: async (ctx, args) => {
    console.log(`resetIfNeeded()`);
    const resetBuffer = await ctx.db.query("resetBuffer").unique();
    if (resetBuffer === null || resetBuffer.pendingResets < 1) {
      throw new Error("attempting to reset with no pending state");
    }
    if (resetBuffer.pendingResets > 1) {
      // There are more pending resets coming, don't change the message yet.
      await ctx.db.patch(resetBuffer._id, {
        pendingResets: resetBuffer.pendingResets - 1,
      });
      console.log(`skipping reset, ${resetBuffer.pendingResets} pending`);
      return;
    }
    await ctx.db.delete(resetBuffer._id);
    console.log(`scheduling reset(${resetBuffer.originalLayout}) in 0s`);
    await ctx.scheduler.runAfter(0, internal.board.reset, {
      layout: resetBuffer.originalLayout,
    });
  },
});

// Wrapper action to call setLayout on Vestaboard.
export const reset = internalAction({
  args: { layout: v.string() },
  handler: async (ctx, { layout }) => {
    console.log(`reset(${layout})`);
    await setLayout(layout);
  },
});
