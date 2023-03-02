import { FormEvent, useState } from "react";
import { useAction } from "../convex/_generated/react";
import { useAuth0 } from "@auth0/auth0-react";

export default function App() {
  const { user, logout } = useAuth0();

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useAction("actions/post");

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage(newMessageText, 60);
  }

  if (!user?.email?.endsWith("@convex.dev")) {
    logout({ returnTo: window.location.origin });
    return <main></main>;
  } else {
    return (
      <main className="happy-page">
        <div className="center">
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Log out
          </button>
          <h1>Vestabuddy</h1>
          <p>send a message to the Vestaboard for one minute:</p>
          <form onSubmit={handleSendMessage}>
            <input
              value={newMessageText}
              size={45}
              maxLength={132}
              onChange={(event) => setNewMessageText(event.target.value)}
              placeholder="Write a message…"
            />
            <input type="submit" value="Send" disabled={!newMessageText} />
          </form>
        </div>
      </main>
    );
  }
}
