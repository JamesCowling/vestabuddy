import fetch from "node-fetch";

// TODO move keys to env vars
const RW_KEY = "NjEyNDdmMzEtZWM2NC00NWNmLWJmNzMtYjM4ZDJlNzUwYWYw";
const RW_HOST = "https://rw.vestaboard.com/";
const API_KEY = "7b2c1221-5961-4240-bfdd-8e726c51af5c";
const API_SECRET = "ZjcyYzFjZTUtNzA4Mi00MWM2LWExZDQtYjhhMzZjYWQwNmZl";
const SUBSCRIPTION = "c7e97d0e-7913-4638-8c24-4d4048c8c317";

export async function getVesta(): Promise<string> {
  return fetch(RW_HOST, {
    method: "GET",
    headers: { "X-Vestaboard-Read-Write-Key": RW_KEY },
  })
    .then((response) => response.json())
    .then((json) => json.currentMessage.layout);
}

export async function setVesta(message: string) {
  await fetch(RW_HOST, {
    method: "POST",
    headers: { "X-Vestaboard-Read-Write-Key": RW_KEY },
    body: message,
  });
}

export async function setVestaString(message: string) {
  await fetch(
    `https://platform.vestaboard.com/subscriptions/${SUBSCRIPTION}/message`,
    {
      method: "POST",
      headers: {
        "X-Vestaboard-Api-Key": API_KEY,
        "X-Vestaboard-Api-Secret": API_SECRET,
      },
      body: `{"text":"${message}"}`,
    }
  );
}
