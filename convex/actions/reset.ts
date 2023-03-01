import { action } from "../_generated/server";
import { setVesta } from "./vesta";

export default action(async ({}, text: string) => {
  console.log("resetting vestaboard to %s", text);
  await setVesta(text);
});
