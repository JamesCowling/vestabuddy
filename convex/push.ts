import { mutation } from "./_generated/server";

export default mutation(async ({ db }, message: string) => {
  await db.insert("messages", { message });
});
