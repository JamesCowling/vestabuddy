import { v } from "convex/values";
import { action, internalAction, internalQuery } from "./_generated/server";
import { getVesta, setVesta, setVestaString } from "./vesta";
import { internal } from "./_generated/api";
import sha256 from "sha256";

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
    await runQuery(internal.board.checkAuth, { serviceAcctKey });

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

export const checkAuth = internalQuery({
  args: { serviceAcctKey: v.optional(v.string()) },
  handler: async ({ auth, db }, { serviceAcctKey }) => {
    if (serviceAcctKey !== undefined) {
      const hashedKey = sha256(serviceAcctKey);
      console.log(serviceAcctKey);
      console.log(hashedKey);
      const serviceAcct = await db
        .query("service_accts")
        .withIndex("by_key", (q) => q.eq("sha256OfKey", hashedKey))
        .unique();
      if (serviceAcct !== null) {
        console.log(`Allowing access from service acct ${serviceAcct.name}`);
        return;
      }

      throw new Error("Invalid serviceAcctKey");
    }
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call");
    }
    if (!identity.email?.endsWith("@convex.dev")) {
      throw new Error("Access restricted to Convex employees");
    }
  },
});
