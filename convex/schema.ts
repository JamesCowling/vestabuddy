import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // A named key for services that authenticate with Vestabuddy.
  serviceKeys: defineTable({
    name: v.string(),
    hash: v.string(),
  }).index("hash", ["hash"]),

  // A singleton document to allow resetting to the original layout.
  resetBuffer: defineTable({
    originalLayout: v.string(), // Layout to reset back to.
    pendingResets: v.number(), // Number of messages that need to be reset.
  }),
});
