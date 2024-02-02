import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    message: v.string(),
  }),
  service_accts: defineTable({
    name: v.string(),
    sha256OfKey: v.string(),
  }).index("by_key", ["sha256OfKey"]),
});
