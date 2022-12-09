import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  messages: defineTable({
    message: s.string(),
  }),
});
