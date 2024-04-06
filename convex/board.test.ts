import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

test("single message", async () => {
  const t = convexTest(schema);
  await t.mutation(internal.board.pushResetter, { message: "msg1" });
  const msg = await t.mutation(internal.board.popResetter, {});
  expect(msg).toStrictEqual("msg1");
});

test("double message", async () => {
  const t = convexTest(schema);
  await t.mutation(internal.board.pushResetter, { message: "msg1" });
  await t.mutation(internal.board.pushResetter, { message: "msg2" });
  const pop1 = await t.mutation(internal.board.popResetter, {});
  expect(pop1).toStrictEqual(null);
  const pop2 = await t.mutation(internal.board.popResetter, {});
  expect(pop2).toStrictEqual("msg1");
});

test("triple message", async () => {
  const t = convexTest(schema);
  await t.mutation(internal.board.pushResetter, { message: "msg1" });
  await t.mutation(internal.board.pushResetter, { message: "msg2" });
  await t.mutation(internal.board.pushResetter, { message: "msg3" });
  const pop1 = await t.mutation(internal.board.popResetter, {});
  expect(pop1).toStrictEqual(null);
  const pop2 = await t.mutation(internal.board.popResetter, {});
  expect(pop2).toStrictEqual(null);
  const pop3 = await t.mutation(internal.board.popResetter, {});
  expect(pop3).toStrictEqual("msg1");
});

test("message reset and another message", async () => {
  const t = convexTest(schema);
  await t.mutation(internal.board.pushResetter, { message: "msg1" });
  const msg = await t.mutation(internal.board.popResetter, {});
  expect(msg).toStrictEqual("msg1");
  await t.mutation(internal.board.pushResetter, { message: "msg2" });
  const msg2 = await t.mutation(internal.board.popResetter, {});
  expect(msg2).toStrictEqual("msg2");
});
