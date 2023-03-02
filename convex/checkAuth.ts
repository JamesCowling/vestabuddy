import { query } from "./_generated/server";

export default query(async ({ auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call");
  }
  if (!identity.email?.endsWith("@convex.dev")) {
    throw new Error("Access restricted to Convex employees");
  }
});
