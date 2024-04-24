import { expect, test, vi, beforeEach, afterEach } from "vitest";

// Mock out Vestaboard functionality so we're not talking to the real thing.
vi.mock("./vesta", () => {
  let vestaboardLayout = "[[init]]";
  return {
    getLayout: vi.fn(() => vestaboardLayout),
    setLayout: vi.fn((layout) => (vestaboardLayout = layout)),
    setMessage: vi.fn((text) => (vestaboardLayout = `[[${text}]]`)),
  };
});
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

import schema from "./schema";
import { convexTest } from "convex-test";
import { getLayout } from "./vesta";
import { api, internal } from "./_generated/api";

// Make sure a post shows up on the vestaboard and then is reset.
test("post", async () => {
  const t = convexTest(schema);
  const initLayout = await getLayout();

  const asJames = t.withIdentity({
    name: "James",
    email: "no-reply@convex.dev",
    emailVerified: true,
  });

  const postMessage = "testytesttest";
  await asJames.mutation(api.board.post, {
    message: postMessage,
    duration: 60,
  });

  vi.advanceTimersByTime(30 * 1000);
  await t.finishInProgressScheduledFunctions();
  expect(await getLayout()).toStrictEqual(`[[${postMessage}]]`); // while posted

  await t.finishAllScheduledFunctions(vi.runAllTimers);
  expect(await getLayout()).toStrictEqual(initLayout); // after reset
});

// Make sure reset works even with a bunch of concurrent messages.
test("reset", async () => {
  const t = convexTest(schema);
  const initLayout = await getLayout();

  const asJames = t.withIdentity({
    name: "James",
    email: "no-reply@convex.dev",
    emailVerified: true,
  });

  for (let i = 0; i < 3; i++) {
    await asJames.action(internal.board.postAuthed, {
      message: `test${i}`,
      duration: 60,
    });
    vi.advanceTimersByTime(30 * 1000);
  }

  await t.finishAllScheduledFunctions(vi.runAllTimers);
  expect(await getLayout()).toStrictEqual(initLayout);
});

// User auth.
test("user", async () => {
  const t = convexTest(schema);

  // Employee.
  const asJames = t.withIdentity({
    name: "James",
    email: "no-reply@convex.dev",
    emailVerified: true,
  });
  await asJames.mutation(api.board.post, {
    message: "yep",
    duration: 60,
  });

  // Impostor.
  const asJomes = t.withIdentity({
    name: "Jomes",
    email: "no-reply@comvex.dev",
    emailVerified: true,
  });
  expect(async () => {
    await asJomes.mutation(api.board.post, {
      message: "nop",
      duration: 60,
    });
  }).rejects.toThrow("Access restricted to Convex employees");

  await t.finishAllScheduledFunctions(vi.runAllTimers);
});

// Service key auth.
test("service", async () => {
  const t = convexTest(schema);

  // Valid service.
  const key = await t.mutation(internal.auth.addServiceKey, { name: "test" });
  await t.mutation(api.board.post, {
    message: "yay",
    duration: 60,
    serviceKey: key,
  });

  // Invalid service.
  await expect(
    t.mutation(api.board.post, {
      message: "nay",
      duration: 60,
      serviceKey: "hunter2",
    }),
  ).rejects.toThrow("Invalid serviceKey");

  await t.finishAllScheduledFunctions(vi.runAllTimers);
});
