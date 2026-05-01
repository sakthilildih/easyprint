import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { setUser, useUser } from "@/store/orders";

export default function Login() {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser.email?.endsWith("@rajalakshmi.edu.in")) {
        await auth.signOut();
        setError("Only @rajalakshmi.edu.in email addresses are allowed.");
        setLoading(false);
        return;
      }

      setUser({
        name: firebaseUser.displayName ?? firebaseUser.email,
        email: firebaseUser.email,
        picture: firebaseUser.photoURL ?? undefined,
      });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      console.error("Login failed:", err);
      if ((err as { code?: string }).code !== "auth/popup-closed-by-user") {
        setError("Sign in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl font-extrabold text-primary-foreground shadow-lg shadow-primary/30">
            E
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">EASYPRINT</h1>
          <p className="text-sm text-muted-foreground">
            Order prints. Get a token. Skip the queue.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/15 p-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={signIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-sm transition active:scale-[.98] disabled:opacity-60"
        >
          <GoogleIcon />
          {loading ? "Signing in…" : "Continue with Google"}
        </button>

        <p className="text-[11px] text-muted-foreground">
          Sign in securely with your @rajalakshmi.edu.in account
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.7 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.7 8.7 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5.1c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.6-3.1-11.3-7.5l-6.6 5.1C9.6 39.2 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6 5.1c-.4.4 6.5-4.7 6.5-14.7 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}