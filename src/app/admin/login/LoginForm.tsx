"use client";

import { useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { CodeField } from "@/components/forms/CodeField";
import { TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";
import { checkLogin, login } from "./actions";

/**
 * Two steps: email and password, then the code. The password stays in this
 * form (never stored) and goes with the code, which is what signs in.
 */
export function LoginForm() {
  const [step, setStep] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function credentials() {
    const form = new FormData();
    form.set("email", email);
    form.set("password", password);
    return form;
  }

  function checkPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await checkLogin(credentials());
      if (result.ok) {
        setMessage(null);
        setStep("code");
      } else setMessage(result.message);
    });
  }

  function submitCode(value: string) {
    startTransition(async () => {
      // On success the action opens the admin; only failures come back.
      const form = credentials();
      form.set("code", value);
      const result = await login(form);
      if (!result.ok) {
        setMessage(result.message);
        setCode("");
      }
    });
  }

  if (step === "password") {
    return (
      <form method="post" onSubmit={checkPassword} className="flex flex-col gap-5">
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {message && (
          <p role="alert" className="text-body-sm text-danger">
            {message}
          </p>
        )}
        <button type="submit" disabled={pending} className={buttonClass({ size: "lg", full: true })}>
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    );
  }

  return (
    <form method="post"
      onSubmit={(event) => {
        event.preventDefault();
        submitCode(code);
      }}
      className="flex flex-col gap-5"
    >
      <p className="text-body-sm text-ink-secondary">
        Signing in as <span className="text-ink">{email}</span>
      </p>
      {recovery ? (
        <TextField
          id="code"
          label="Recovery code"
          autoComplete="off"
          autoFocus
          value={code}
          onChange={(event) => setCode(event.target.value)}
          error={message ?? undefined}
          hint="One of the codes you saved when two-factor login was set up. Each works once."
          required
        />
      ) : (
        <CodeField
          id="code"
          label="Code from your authenticator app"
          value={code}
          onChange={(value) => {
            setCode(value);
            if (message) setMessage(null);
          }}
          onComplete={submitCode}
          error={message}
          disabled={pending}
        />
      )}
      <button type="submit" disabled={pending} className={buttonClass({ size: "lg", full: true })}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setStep("password");
            setCode("");
            setMessage(null);
            setRecovery(false);
          }}
          className="inline-flex items-center gap-1.5 text-label text-primary hover:underline"
        >
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} /> Back
        </button>
        <button
          type="button"
          onClick={() => {
            setRecovery(!recovery);
            setCode("");
            setMessage(null);
          }}
          className="text-label text-primary hover:underline"
        >
          {recovery ? "Use the authenticator app" : "Lost your phone? Use a recovery code"}
        </button>
      </div>
    </form>
  );
}
