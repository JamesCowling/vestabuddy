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
import { convexTest, TestConvex } from "convex-test";
import { getLayout } from "./vesta";
import { api, internal } from "./_generated/api";

// Make sure a post shows up on the vestaboard and then is reset.
test("postAuthed", async () => {
  const t = convexTest(schema);
  const initLayout = await getLayout();

  const postMessage = "testytesttest";
  await t.action(internal.board.postAuthed, {
    message: postMessage,
    duration: 60,
  });
  vi.advanceTimersByTime(30 * 1000);

  expect(await getLayout()).toStrictEqual(`[[${postMessage}]]`); // while posted

  await runScheduledFunctionsUntilCompletion(t);

  expect(await getLayout()).toStrictEqual(initLayout); // after reset
});

async function runScheduledFunctionsUntilCompletion(t: TestConvex<any>) {
  for (let i = 0; i < 100; i++) {
    vi.runAllTimers();
    await t.finishInProgressScheduledFunctions();
  }
}

// XXX This is a version of postAuthed that uses an auth identity. It doesn't
// seem to scheduled jobs to completion and it also doesn't show console logs.
test.skip("post", async () => {
  const t = convexTest(schema);
  const initLayout = await getLayout();
  console.log(`initLayout: ${initLayout}`); // initLayout: [[init]

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

  expect(await getLayout()).toStrictEqual(`[[${postMessage}]]`); // while posted

  // XXX There appears to be a bug with the test framework here. `resetIfNeeded`
  // is scheduled but it never runs.
  for (let i = 0; i < 100; i++) {
    vi.runAllTimers();
    await t.finishInProgressScheduledFunctions();
  }

  expect(await getLayout()).toStrictEqual(initLayout); // after reset
});

// Make sure reset works even with a bunch of concurrent messages.
test("reset", async () => {
  const t = convexTest(schema);
  const initLayout = await getLayout();

  for (let i = 0; i < 3; i++) {
    await t.action(internal.board.postAuthed, {
      message: `test${i}`,
      duration: 60,
    });
    vi.advanceTimersByTime(30 * 1000);
  }

  for (let i = 0; i < 100; i++) {
    vi.runAllTimers();
    await t.finishInProgressScheduledFunctions();
  }
  expect(await getLayout()).toStrictEqual(initLayout); // after reset
});

test("auth", async () => {
  const t = convexTest(schema);

  // Employee
  const asJames = t.withIdentity({
    name: "James",
    email: "no-reply@convex.dev",
    emailVerified: true,
  });
  await asJames.mutation(api.board.post, { message: "test", duration: 60 });

  // Impostor
  const asJomes = t.withIdentity({
    name: "Jomes",
    email: "no-reply@comvex.dev",
    emailVerified: true,
  });
  expect(async () => {
    await asJomes.mutation(api.board.post, { message: "test", duration: 60 });
  }).rejects.toThrow("Access restricted to Convex employees");

  for (let i = 0; i < 100; i++) {
    vi.runAllTimers();
    await t.finishInProgressScheduledFunctions();
  }
});

// TODO: Once I figure out what's going on with the tests, change them all to
// use t.withIdentity. Then add a test for service key login.
