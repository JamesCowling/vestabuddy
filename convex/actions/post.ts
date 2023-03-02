import { action } from "../_generated/server";
import { getVesta, setVestaString } from "./vesta";

export default action(
  async ({ scheduler, runQuery }, message: string, duration: number) => {
    await runQuery("checkAuth");

    // Vestaboard rate-limits below 15 seconds.
    const delay = Math.max(Number(duration), 15); // duration is bigint when called from python

    const current = await getVesta();
    console.log("setting vestaboard to %s", message);
    await setVestaString(message);
    console.log("resetting vestaboard in %d s", delay);
    await scheduler.runAfter(1000 * delay, "actions/reset", current);
  }
);
