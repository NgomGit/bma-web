"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogoMark } from "@/components/brand/Logo";
import { signIn, type FormState } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn--primary w-full" style={{ opacity: pending ? 0.6 : 1 }}>
      {pending ? "Vérification…" : "Entrer"}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<FormState, FormData>(signIn, {});
  return (
    <div className="grid place-items-center" style={{ minHeight: "70svh" }}>
      <form action={action} className="card w-full max-w-[380px] p-7 grid gap-5 hover:!translate-y-0">
        <span className="grid gap-3 justify-items-center text-center">
          <LogoMark className="w-12 h-12" />
          <span>
            <b className="block text-[19px] tracking-[-.03em]">Back-office BMA</b>
            <small className="block text-[12.5px] mt-1" style={{ color: "var(--ink-3)" }}>
              Gestion du parc automobile
            </small>
          </span>
        </span>

        <input type="hidden" name="suite" value={next} />
        <div className="grid gap-3.5">
        <label className="block">
          <span className="block text-[11px] font-medium tracking-[.1em] uppercase mb-1.5" style={{ color: "var(--ink-3)" }}>
            Email
          </span>
          <input
            name="email" type="email" required autoFocus autoComplete="username" inputMode="email"
            className="w-full rounded-[10px] border px-3.5 py-2.5 text-[14px] outline-none focus:border-[var(--brand)]"
            style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink)" }}
          />
        </label>
        <label className="block">
          <span className="block text-[11px] font-medium tracking-[.1em] uppercase mb-1.5" style={{ color: "var(--ink-3)" }}>
            Mot de passe
          </span>
          <input
            name="password" type="password" required autoComplete="current-password"
            className="w-full rounded-[10px] border px-3.5 py-2.5 text-[14px] outline-none focus:border-[var(--brand)]"
            style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink)" }}
          />
        </label>
        </div>

        {state.error && (
          <p className="text-[13px] rounded-[10px] px-3.5 py-2.5"
             style={{ background: "rgba(229,72,77,.08)", color: "#E5484D" }}>
            {state.error}
          </p>
        )}
        <Submit />
      </form>
    </div>
  );
}
