"use client";

import { startTransition, useActionState } from "react";
import { TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { message: null });
  return (
    <form
      // Submitted by hand so a failed attempt keeps what was typed (a form
      // action would clear the fields).
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-5"
    >
      <TextField id="email" label="Email" type="email" autoComplete="username" required />
      <TextField id="password" label="Password" type="password" autoComplete="current-password" required />
      <TextField
        id="code"
        label="Code from your authenticator app"
        hint="Lost your phone? Use one of your recovery codes."
        inputMode="numeric"
        autoComplete="one-time-code"
        required
      />
      {state.message && (
        <p role="alert" className="text-body-sm text-danger">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass({ size: "lg", full: true })}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
