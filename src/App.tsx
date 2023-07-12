import { FormEvent, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  AuthLoading,
  Authenticated,
  Unauthenticated,
  useAction,
  useConvexAuth,
} from "convex/react";
import { api } from "../convex/_generated/api";

function LoggedOut() {
  const { loginWithRedirect } = useAuth0();
  return (
    <main className="sad-page">
      <div className="center">
        <button onClick={() => loginWithRedirect()}>Log in</button>
        <h1>🔐 employees only</h1>
      </div>
    </main>
  );
}

function Loading() {
  return (
    <main className="excited-page">
      <div className="center">
        <h1>ooh it's loading...</h1>
      </div>
    </main>
  );
}

function LoggedIn() {
  const { user, logout } = useAuth0();

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useAction(api.board.post);

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage({ message: newMessageText, duration: 60 });
  }

  if (!user?.email?.endsWith("@convex.dev")) {
    logout({ logoutParams: { returnTo: window.location.origin } });
    return <main></main>;
  } else {
    return (
      <main className="happy-page">
        <div className="center">
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
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

export default function App() {
  return (
    <div className="App">
      <Authenticated>
        <LoggedIn />
      </Authenticated>
      <Unauthenticated>
        <LoggedOut />
      </Unauthenticated>
      <AuthLoading>
        <Loading />
      </AuthLoading>
    </div>
  );
}
