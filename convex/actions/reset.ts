import { action } from "../_generated/server";
import { setVesta } from "./vesta";

export default action(async ({ runQuery }, text: string) => {
  await runQuery("checkAuth");

  console.log("resetting vestaboard to %s", text);
  await setVesta(text);
});
