// Basic libraries for reading and writing to a Vestaboard.
//
// Requires the VESTA_RW_KEY environment variable to be set in the Convex
// dashboard. This key is available under the Read/Write API tab in the API
// section of https://web.vestaboard.com/.

import fetch from "node-fetch";

const RW_HOST = "https://rw.vestaboard.com/";

/// Get the current layout from the Vestaboard.
export async function getLayout(): Promise<string> {
  const response = await fetch(RW_HOST, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Vestaboard-Read-Write-Key": process.env.VESTA_RW_KEY!,
    },
  });
  const respText = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status}: ${respText}`);
  }
  const json = JSON.parse(respText);
  return json.currentMessage.layout;
}

/// Set the vestaboard to the encoded message.
export async function setLayout(layout: string) {
  console.log(`setting vestaboard to layout ${layout}`);
  const response = await fetch(RW_HOST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Vestaboard-Read-Write-Key": process.env.VESTA_RW_KEY!,
    },
    body: layout,
  });
  const respText = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status}: ${respText}`);
  }
  const json = JSON.parse(respText);
  console.log(json.status);
}

/// Set the Vestaboard to the given text string.
export async function setMessage(text: string) {
  console.log(`setting vestaboard to text ${text}`);
  const response = await fetch(RW_HOST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Vestaboard-Read-Write-Key": process.env.VESTA_RW_KEY!,
    },
    body: JSON.stringify({ text: text }),
  });
  const respText = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status}: ${respText}`);
  }
  const json = JSON.parse(respText);
  console.log(json.status);
}
