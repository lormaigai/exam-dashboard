"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  getLastSyncedAt,
  isExamOSData,
  pullCloudData,
  pushLocalData,
  saveLegacyBackup,
  startAutoSync,
  subscribeLastSyncedAt
} from "@/lib/cloudSync";

const STORAGE_KEY = "examos-data-v1";

type AccountContextValue = {
  email: string | null;
  signOut: () => Promise<void>;
  lastSyncedAt: string | null;
  syncNow: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue>({
  email: null,
  signOut: async () => {},
  lastSyncedAt: null,
  syncNow: async () => {}
});

export function useAccount() {
  return useContext(AccountContext);
}

function LoadingCard({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper text-ink dark:bg-[#111817] dark:text-white">
      <div className="rounded-lg border border-black/10 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
        {label}
      </div>
    </main>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password
        });
        if (signInError) setError(signInError.message);
        // On success the auth listener in AuthGate takes over.
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password
        });
        if (signUpError) {
          setError(signUpError.message);
        } else if (!data.session) {
          // Email confirmation is required before a session is issued.
          setNotice("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
          setPassword("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setNotice("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email above first, then use Forgot password.");
      return;
    }
    setSendingReset(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: window.location.href
      });
      if (resetError) setError(resetError.message);
      else setNotice("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset email. Please try again.");
    } finally {
      setSendingReset(false);
    }
  }

  const inputClass =
    "focus-ring w-full rounded-md border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5";
  const tabClass = (active: boolean) =>
    `focus-ring rounded px-3 py-2 text-sm font-medium transition ${
      active
        ? "bg-white text-ink shadow-soft dark:bg-white/15 dark:text-white"
        : "text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white"
    }`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10 text-ink dark:bg-[#111817] dark:text-[#eef2ef]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-lg bg-pine text-2xl font-bold text-white">
            E
          </span>
          <h1 className="mt-4 text-2xl font-semibold">ExamOS</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-white/55">Track your 2026 exam prep</p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-md bg-black/5 p-1 dark:bg-white/10">
            <button type="button" className={tabClass(mode === "signin")} onClick={() => switchMode("signin")}>
              Sign in
            </button>
            <button type="button" className={tabClass(mode === "signup")} onClick={() => switchMode("signup")}>
              Create account
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                className={inputClass}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Password</span>
                {mode === "signin" ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-pine hover:underline disabled:opacity-60"
                    onClick={handleForgotPassword}
                    disabled={sendingReset}
                  >
                    {sendingReset ? "Sending reset email..." : "Forgot password?"}
                  </button>
                ) : null}
              </div>
              <input
                className={inputClass}
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              />
              {mode === "signup" ? (
                <p className="mt-1 text-xs text-ink/50 dark:text-white/45">Use at least 8 characters.</p>
              ) : null}
            </div>
            {error ? (
              <p className="rounded-md border border-coral/40 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p>
            ) : null}
            {notice ? (
              <p className="rounded-md border border-pine/40 bg-pine/10 px-3 py-2 text-sm text-pine">{notice}</p>
            ) : null}
            <button
              type="submit"
              className="focus-ring w-full rounded-md bg-pine px-4 py-2 font-medium text-white transition hover:bg-pine/90 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting
                ? mode === "signin"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-ink/50 dark:text-white/45">
          Your progress is stored on this device and synced to your account.
        </p>
      </div>
    </main>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(getLastSyncedAt());

  const userId = session?.user?.id ?? null;
  const email = session?.user?.email ?? null;

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setChecking(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setChecking(false);
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => subscribeLastSyncedAt(setLastSyncedAt), []);

  // Reconcile once per signed-in user, then keep auto-sync running until
  // sign-out or unmount. Children stay unmounted until this finishes because
  // the app reads localStorage on mount.
  useEffect(() => {
    if (!userId || !email) {
      setReadyUserId(null);
      return;
    }
    let cancelled = false;
    let stopAutoSync: (() => void) | null = null;

    (async () => {
      try {
        const cloud = await pullCloudData(userId);
        if (cancelled) return;
        if (cloud && isExamOSData(cloud.data)) {
          // Cloud wins — the app normalizes whatever it finds on load.
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud.data));
        } else {
          if (cloud) {
            // The row was written by the old Y4 Exam Control page. Preserve it
            // so the first ExamOS push carries it along instead of erasing it.
            saveLegacyBackup(cloud.data);
          }
          // First ExamOS login from this account: back up the local data.
          await pushLocalData(userId, email);
        }
      } catch {
        // Offline or transient error — continue with local data so the
        // local-first app still works; auto-sync will retry pushes.
      }
      if (cancelled) return;
      stopAutoSync = startAutoSync(userId, email);
      setReadyUserId(userId);
    })();

    return () => {
      cancelled = true;
      if (stopAutoSync) stopAutoSync();
      setReadyUserId(null);
    };
  }, [userId, email]);

  const signOut = useCallback(async () => {
    // Signing out keeps local data; only the Supabase session is cleared.
    await supabase.auth.signOut();
  }, []);

  const syncNow = useCallback(async () => {
    if (!userId || !email) return;
    await pushLocalData(userId, email);
  }, [userId, email]);

  if (checking) return <LoadingCard label="Loading ExamOS..." />;
  if (!session || !userId) return <AuthScreen />;
  if (readyUserId !== userId) return <LoadingCard label="Syncing your data..." />;

  return (
    <AccountContext.Provider value={{ email, signOut, lastSyncedAt, syncNow }}>
      {children}
    </AccountContext.Provider>
  );
}
