import fetch from "node-fetch";
import { action } from "../_generated/server";
import { getVesta, setVesta, setVestaString } from "./vesta";

const BACKEND = "https://silent-mosquito-517.convex.cloud/api/action"; // TODO make this dynamic
const ZEPLO_TOKEN = "LCZNasvAXm791qsDeFwJPiM6VxfAFIC0hgdZZh"; // TODO move to env vars

export default action(
  async ({ mutation }, message: string, duration: number) => {
    // save current vestaboard message
    const current = await getVesta();
    await mutation("push", current);

    // overwrite the current message with the one provided
    await setVestaString(message);

    // ask zeplo to reset the message in 10 seconds
    await fetch(
      `https://zeplo.to/${BACKEND}?_delay=${duration}&_token=${ZEPLO_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"path":"actions/reset", "args":[]}',
      }
    );
  }
);
