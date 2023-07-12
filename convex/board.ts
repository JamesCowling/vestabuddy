import { v } from "convex/values";
import { action, internalAction, internalQuery } from "./_generated/server";
import { getVesta, setVesta, setVestaString } from "./vesta";
import { internal } from "./_generated/api";

export const post = action({
  args: { message: v.string(), duration: v.float64() },
  handler: async ({ scheduler, runQuery }, { message, duration }) => {
    await runQuery(internal.board.checkAuth, {});

    // Vestaboard rate-limits below 15 seconds.
    // XXX is this still an issue?
    const delay = Math.max(Number(duration), 15); // duration is bigint when called from python

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

export const checkAuth = internalQuery({
  args: {},
  handler: async ({ auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call");
    }
    if (!identity.email?.endsWith("@convex.dev")) {
      throw new Error("Access restricted to Convex employees");
    }
  },
});
