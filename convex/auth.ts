import { v } from "convex/values";
import sha256 from "sha256";
import { internalMutation, internalQuery } from "./_generated/server";
import { v4 as uuidv4 } from "uuid";

export const checkAuth = internalQuery({
  args: { serviceAcctKey: v.optional(v.string()) },
  handler: async ({ auth, db }, { serviceAcctKey }) => {
    if (serviceAcctKey !== undefined) {
      const hashedKey = sha256(serviceAcctKey);
      const serviceAcct = await db
        .query("service_accts")
        .withIndex("by_key", (q) => q.eq("sha256OfKey", hashedKey))
        .unique();
      if (serviceAcct !== null) {
        console.log(`Allowing access from service acct ${serviceAcct.name}`);
        return serviceAcct.name;
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

/// Call with `npx convex run auth:addServiceAcct '{"name": "myserviceacctname"}'`
export const addServiceAcct = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const key = uuidv4();
    const sha256OfKey = sha256(key);
    ctx.db.insert("service_accts", { name, sha256OfKey });
    return key;
  },
});
