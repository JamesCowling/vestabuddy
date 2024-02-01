import fetch from "node-fetch";

const VESTA_RW_HOST = "https://rw.vestaboard.com/";
// const VESTA_RW_KEY       = <defined in convex dashboard>
// const VESTA_API_KEY      = <defined in convex dashboard>
// const VESTA_API_SECRET   = <defined in convex dashboard>
// const VESTA_SUBSCRIPTION = <defined in convex dashboard>

export async function getVesta(): Promise<string> {
  const response = await fetch(VESTA_RW_HOST!, {
    method: "GET",
    headers: {
      "X-Vestaboard-Read-Write-Key": process.env.VESTA_RW_KEY!,
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  if (response.status !== 200) {
    throw new Error(`${response.status}: ${JSON.stringify(json)}`);
  }
  return json.currentMessage.layout;
}

export async function setVesta(message: string) {
  await fetch(VESTA_RW_HOST!, {
    method: "POST",
    headers: {
      "X-Vestaboard-Read-Write-Key": process.env.VESTA_RW_KEY!,
      "Content-Type": "application/json",
    },
    body: message,
  })
    .then((response) => response.json())
    .then((json) => console.log(json.status));
}

export async function setVestaString(text: string) {
  await fetch(
    `https://platform.vestaboard.com/subscriptions/${process.env
      .VESTA_SUBSCRIPTION!}/message`,
    {
      method: "POST",
      headers: {
        "X-Vestaboard-Api-Key": process.env.VESTA_API_KEY!,
        "X-Vestaboard-Api-Secret": process.env.VESTA_API_SECRET!,
      },
      body: `{"text":"${text}"}`,
    }
  );
}
