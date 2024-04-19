// Functions for authenticating users and service accounts.
//
// Ideally we wouldn't be rolling our own security code like this but it's
// protecting a Vestaboard. I think we'll be okay.

import { v } from "convex/values";
import {
  DatabaseReader,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { Auth } from "convex/server";

/// Generate a random key.
function generateKey(): string {
  return crypto.randomUUID();
}

/// Hash a secret key.
async function hashKey(key: string): Promise<string> {
  // If we were doing something more secure we should use something like bcrypt
  // and salt the hash.
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Check if service key is registered.
export async function checkServiceKey(db: DatabaseReader, serviceKey: string) {
  const hash = await hashKey(serviceKey);
  const doc = await db
    .query("serviceKeys")
    .withIndex("hash", (q) => q.eq("hash", hash))
    .unique();
  if (doc == null) {
    throw new Error("Invalid serviceKey");
  }
}

// Check if logged in as a Convex employee.
export async function checkAuth(auth: Auth) {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call");
  }
  if (!identity.emailVerified || !identity.email?.endsWith("@convex.dev")) {
    throw new Error("Access restricted to Convex employees");
  }
}

/// Add a service key with a given name to Vestabuddy. A service key is a key
/// that can be used in place of auth context. This is particularly useful when
/// calling the http post handler or issuing requests from the command line.
export const addServiceKey = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const key = generateKey();
    const hash = await hashKey(key);
    await ctx.db.insert("serviceKeys", { name, hash });
    return key;
  },
});
