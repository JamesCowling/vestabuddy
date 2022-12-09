import { action } from "../_generated/server";
import { setVesta } from "./vesta";

export default action(async ({ query }) => {
  const prev = await query("pop");
  await setVesta(prev);
});
