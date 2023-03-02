import { action } from "../_generated/server";
import { setVesta } from "./vesta";

export default action(async ({ runQuery }, text: string) => {
  // Can't check the auth context here since it's a scheduled function, so this
  // is actually a security hole.

  console.log("resetting vestaboard to %s", text);
  await setVesta(text);
});
