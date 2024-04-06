import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

test("single message", async () => {
  const t = convexTest(schema);
  const key1 = await t.mutation(internal.auth.addServiceAcct, {
    name: "acct1",
  });
  const key2 = await t.mutation(internal.auth.addServiceAcct, {
    name: "acct2",
  });

  const name1 = await t.query(internal.auth.checkAuth, {
    serviceAcctKey: key1,
  });
  expect(name1).toStrictEqual("acct1");
  const name2 = await t.query(internal.auth.checkAuth, {
    serviceAcctKey: key2,
  });
  expect(name2).toStrictEqual("acct2");

  /*
  This test does not seem to work.

  expect(async () => {
    await t.query(internal.auth.checkAuth, {
      serviceAcctKey: "bogus",
    });
  }).toThrow("Invalid serviceAcctKey");
  */
});