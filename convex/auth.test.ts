import { expect, test } from "vitest";
import schema from "./schema";
import { convexTest } from "convex-test";
import { checkAuth, checkServiceKey } from "./auth";
import { internal } from "./_generated/api";

test("service key", async () => {
  const t = convexTest(schema);

  // Valid service key.
  const key = await t.mutation(internal.auth.addServiceKey, { name: "test" });
  await t.run(async (ctx) => {
    await checkServiceKey(ctx.db, key);
  });

  // Invalid service key.
  await t.run(async (ctx) => {
    await expect(checkServiceKey(ctx.db, "invalid")).rejects.toThrow(
      "Invalid serviceKey"
    );
  });
});

test("user identity", async () => {
  const t = convexTest(schema);

  // Valid employee.
  const asJames = t.withIdentity({
    name: "James",
    email: "no-reply@convex.dev",
    emailVerified: true,
  });
  await asJames.run(async (ctx) => {
    await checkAuth(ctx.auth);
  });

  // No identity.
  await t.run(async (ctx) => {
    await expect(checkAuth(ctx.auth)).rejects.toThrow("Unauthenticated call");
  });

  // Invalid unemployees.
  const asJomes = t.withIdentity({
    name: "Jomes",
    email: "no-reply@comvex.dev",
    emailVerified: true,
  });
  await asJomes.run(async (ctx) => {
    await expect(checkAuth(ctx.auth)).rejects.toThrow(
      "Access restricted to Convex employees"
    );
  });
  const asJumes = t.withIdentity({
    name: "Jumes",
    email: "no-reply@convex.dev",
    emailVerified: false,
  });
  await asJumes.run(async (ctx) => {
    await expect(checkAuth(ctx.auth)).rejects.toThrow(
      "Access restricted to Convex employees"
    );
  });
});
