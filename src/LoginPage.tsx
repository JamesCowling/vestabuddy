import { useAuth0 } from "@auth0/auth0-react";

export default function LoginPage() {
  const { isLoading, loginWithRedirect } = useAuth0();
  return (
    <main className="sad-page">
      <div className="center">
        <button disabled={isLoading} onClick={loginWithRedirect}>
          Log in
        </button>
        <h1>🔐 employees only</h1>
      </div>
    </main>
  );
}
