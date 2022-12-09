import { query } from "./_generated/server";

export default query(async ({ db }) => {
  const doc = await db.query("messages").order("desc").first();
  return doc!.message;
});
