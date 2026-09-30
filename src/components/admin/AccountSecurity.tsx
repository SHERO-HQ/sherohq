"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, X } from "lucide-react";
import {
  cancelTwoFactor,
  changePassword,
  confirmTwoFactor,
  renewRecoveryCodes,
  signOutEverywhereElse,
  startTwoFactor,
  type AccountResult,
} from "@/app/admin/(app)/settings/account-actions";
import { Badge } from "@/components/admin/Badge";
import { CodeField } from "@/components/forms/CodeField";
import { TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/Button";

type Open = "password" | "phone" | "codes" | null;

function Result({ result }: { result: AccountResult | null }) {
  if (!result?.message) return null;
  return result.ok ? (
    <p role="status" className="rounded-sm bg-secondary-subtle px-4 py-3 text-body-sm text-secondary">
      {result.message}
    </p>
  ) : (
    <p role="alert" className="rounded-sm bg-danger-subtle px-4 py-3 text-body-sm text-danger">
      {result.message}
    </p>
  );
}

function Row({ title, detail, children }: { title: string; detail: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <div className="flex min-w-0 flex-col">
        <span className="text-label text-ink">{title}</span>
        <span className="text-body-sm text-ink-secondary">{detail}</span>
      </div>
      {children}
    </div>
  );
}

const linkButton = "text-label text-primary hover:underline";

export function AccountSecurity({
  email,
  twoFactorSince,
  setup,
  passwordChanged,
  recoveryLeft,
  otherSessions,
}: {
  email: string;
  twoFactorSince: string | null;
  /** A new phone being set up: its QR code and the key to type instead. */
  setup: { qrSvg: string; key: string } | null;
  passwordChanged: string;
  recoveryLeft: number;
  otherSessions: number;
}) {
  const [open, setOpen] = useState<Open>(setup ? "phone" : null);
  const [result, setResult] = useState<AccountResult | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [pending, startTransition] = useTransition();

  // Runs an action; closes the open form when it worked.
  function run(action: () => Promise<AccountResult>, close = true) {
    startTransition(async () => {
      const outcome = await action();
      setResult(outcome);
      if (outcome.ok && outcome.codes) setCodes(outcome.codes);
      if (outcome.ok && close) setOpen(null);
    });
  }

  function submit(action: (form: FormData) => Promise<AccountResult>, close = true) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      run(() => action(form), close);
    };
  }

  const toggle = (which: Exclude<Open, null>) => {
    setResult(null);
    setOpen(open === which ? null : which);
  };

  const currentPassword = (id: string) => (
    <TextField id={id} name="currentPassword" label="Your current password" type="password" autoComplete="current-password" required />
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-ink-secondary">
        Signed in as <span className="text-ink">{email}</span>.
      </p>
      {!(setup && result && !result.ok) && <Result result={result} />}

      {/* Two-factor login */}
      <Row
        title="Two-factor login"
        detail={twoFactorSince ? `Authenticator app, since ${twoFactorSince}` : "Authenticator app"}
      >
        <div className="flex items-center gap-4">
          <Badge tone={twoFactorSince ? "done" : "todo"}>{twoFactorSince ? "On" : "Off"}</Badge>
          {!setup && (
            <button type="button" onClick={() => toggle("phone")} aria-expanded={open === "phone"} className={linkButton}>
              Move to a new phone
            </button>
          )}
        </div>
      </Row>
      {open === "phone" && !setup && (
        <form onSubmit={submit(startTwoFactor, false)} className="flex flex-col gap-4 rounded-sm bg-surface p-4">
          <p className="text-body-sm text-ink-secondary">
            The current phone keeps working until the new one gives a code that matches.
          </p>
          {currentPassword("phone-password")}
          <button type="submit" disabled={pending} className={buttonClass({ className: "self-start" })}>
            Show the setup code
          </button>
        </form>
      )}
      {setup && (
        <SetupDialog
          setup={setup}
          pending={pending}
          onConfirm={(code) => {
            const form = new FormData();
            form.set("code", code);
            run(() => confirmTwoFactor(form));
          }}
          onCancel={() => run(cancelTwoFactor)}
          error={result && !result.ok ? result.message : null}
        />
      )}

      {/* Password */}
      <Row title="Password" detail={passwordChanged}>
        <button type="button" onClick={() => toggle("password")} aria-expanded={open === "password"} className={linkButton}>
          Change
        </button>
      </Row>
      {open === "password" && (
        <form onSubmit={submit(changePassword)} className="flex flex-col gap-4 rounded-sm bg-surface p-4">
          {currentPassword("password-current")}
          <TextField
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="At least 12 characters."
            required
          />
          <TextField id="repeatPassword" label="New password again" type="password" autoComplete="new-password" required />
          <button type="submit" disabled={pending} className={buttonClass({ className: "self-start" })}>
            Change password
          </button>
        </form>
      )}

      {/* Recovery codes */}
      <Row
        title="Recovery codes"
        detail={
          codes
            ? "New codes below; the old ones no longer work."
            : `${recoveryLeft} of 8 left. Each signs in once without the phone.`
        }
      >
        <button type="button" onClick={() => toggle("codes")} aria-expanded={open === "codes"} className={linkButton}>
          Make new codes
        </button>
      </Row>
      {open === "codes" && (
        <form onSubmit={submit(renewRecoveryCodes)} className="flex flex-col gap-4 rounded-sm bg-surface p-4">
          <p className="text-body-sm text-ink-secondary">The old codes stop working. The new ones are shown once.</p>
          {currentPassword("codes-password")}
          <button type="submit" disabled={pending} className={buttonClass({ className: "self-start" })}>
            Make new codes
          </button>
        </form>
      )}
      {codes && <RecoveryCodes codes={codes} />}

      {/* Sessions */}
      <Row
        title="Signed in elsewhere"
        detail={otherSessions === 0 ? "Only this device." : `${otherSessions} other ${otherSessions === 1 ? "device" : "devices"}.`}
      >
        {otherSessions > 0 && (
          <button type="button" disabled={pending} onClick={() => run(signOutEverywhereElse)} className={linkButton}>
            Sign them out
          </button>
        )}
      </Row>
    </div>
  );
}

/** The new phone's QR code, in a modal: scan, then type the code it shows. */
function SetupDialog({
  setup,
  pending,
  error,
  onConfirm,
  onCancel,
}: {
  setup: { qrSvg: string; key: string };
  pending: boolean;
  error: string | null;
  onConfirm: (code: string) => void;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    // showModal focuses the first button; start in the code boxes instead.
    el?.querySelector<HTMLInputElement>("#new-phone-code")?.focus();
    return () => el?.close();
  }, []);

  // A failed code clears the boxes for the next try.
  const [seenError, setSeenError] = useState(error);
  if (error !== seenError) {
    setSeenError(error);
    if (error) setCode("");
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="setup-title"
      // Escape cancels the setup; the current phone keeps working.
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-full max-w-md rounded-md border border-border bg-surface-raised p-0 text-ink backdrop:bg-black/50"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(code);
        }}
        className="flex flex-col gap-5 p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="setup-title" className="font-display text-h3 text-heading">
            Set up the new phone
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            aria-label="Cancel"
            className="-m-2 flex size-10 items-center justify-center rounded-sm text-ink-secondary hover:text-ink"
          >
            <X aria-hidden="true" size={20} strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-body-sm text-ink-secondary">
          In the authenticator app on the new phone, add an account and scan this code. The current phone keeps working
          until the new one gives a code that matches.
        </p>
        <div
          role="img"
          aria-label="QR code for the authenticator app"
          className="size-48 self-center rounded-sm bg-surface-raised [&_svg]:size-full"
          // Rendered on the server by the qrcode package: black on white, as scanners expect.
          dangerouslySetInnerHTML={{ __html: setup.qrSvg }}
        />
        <p className="text-body-sm text-ink-secondary">
          Can&rsquo;t scan? Type this key instead:
          <span className="mt-1 flex flex-wrap gap-x-2 font-mono text-ink">
            {setup.key.split(" ").map((group, i) => (
              <span key={i}>{group}</span>
            ))}
          </span>
        </p>
        <CodeField
          id="new-phone-code"
          label="The 6-digit code the new phone shows"
          value={code}
          onChange={setCode}
          onComplete={onConfirm}
          error={error}
          disabled={pending}
        />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending || code.length < 6} className={buttonClass()}>
            {pending ? "Checking…" : "Use the new phone"}
          </button>
          <button type="button" disabled={pending} onClick={onCancel} className={linkButton}>
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}

/** New recovery codes, shown once, with a button to copy them all. */
function RecoveryCodes({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState<boolean | null>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`SHERO admin recovery codes\n${codes.join("\n")}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-warning bg-warning-subtle p-4">
      <p className="text-body-sm text-ink">
        Keep these somewhere safe, away from the phone, such as a password manager. They won&rsquo;t be shown again.
      </p>
      <ul className="grid grid-cols-2 gap-2 font-mono text-body-sm text-ink">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={copy} className={buttonClass({ variant: "outline" })}>
          {copied ? <Check aria-hidden="true" size={16} strokeWidth={1.5} /> : <Copy aria-hidden="true" size={16} strokeWidth={1.5} />}
          {copied ? "Copied" : "Copy codes"}
        </button>
        <span role="status" className="text-body-sm text-ink-secondary">
          {copied === false ? "Couldn't copy here; select the codes and copy them by hand." : ""}
        </span>
      </div>
    </div>
  );
}
