import { FormEvent, useState } from "react";
import { useAction } from "../convex/_generated/react";

export default function App() {
  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useAction("actions/post");

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage(newMessageText, 60);
  }

  return (
    <main className="center">
      <h1>Vestabuddy</h1>
      <p>Send a message to the Vestaboard for one minute:</p>
      <form onSubmit={handleSendMessage}>
        <input
          value={newMessageText}
          size={40}
          maxLength={132}
          onChange={(event) => setNewMessageText(event.target.value)}
          placeholder="Write a message…"
        />
        <input type="submit" value="Send" disabled={!newMessageText} />
      </form>
    </main>
  );
}
