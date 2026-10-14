"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DEMO, makeCode, safeNext, strength, useSession } from "@/lib/session";
import { useMarket, useT } from "../global/market-context";
import { Seal } from "../global/brand";
import { ChaiStillLife } from "../order/order-confirmed";

type Step = "email" | "password" | "code" | "create" | "reset";
const EMAIL = /^\S+@\S+\.\S+$/;

/* ------------------------------------------------------------------ small parts */

function Field({
  label,
  error,
  hint,
  trailing,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null; hint?: React.ReactNode; trailing?: React.ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      {/* only the name is the label; the error and hint are linked by aria-describedby */}
      <label htmlFor={id} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <span className="relative flex">
        <input
          id={id}
          {...input}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className={`h-12 w-full rounded-xl border bg-warm px-4 text-[16px] outline-none transition-colors focus:border-ink ${trailing ? "pr-20" : ""} ${error ? "border-chilli" : "border-line"} ${input.className ?? ""}`}
        />
        {trailing ? <span className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</span> : null}
      </span>
      {error ? (
        <span id={`${id}-err`} role="alert" className="flex items-center gap-1 text-sm text-chilli">
          <span aria-hidden="true">⚠</span> {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function Primary({ children, busy, ...b }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      type="submit"
      {...b}
      disabled={busy || b.disabled}
      className="relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-ink px-6 text-[15px] font-semibold text-linen transition-colors hover:bg-ink-soft disabled:opacity-80"
    >
      {children}
      {busy ? <span aria-hidden="true" className="pay-progress absolute inset-x-0 bottom-0 h-[3px] bg-turmeric" /> : null}
    </button>
  );
}

function Social({ provider, onClick }: { provider: "google" | "apple"; onClick: () => void }) {
  const t = useT();
  return (
    <button type="button" onClick={onClick} className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-warm text-[15px] font-semibold transition-colors hover:border-ink-muted/50 hover:bg-white">
      {provider === "google" ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M16.4 12.7c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9a5 5 0 0 0-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.5.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-3-4.1ZM13.9 5.1c.7-.8 1.1-1.9 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
        </svg>
      )}
      {provider === "google" ? t.continueGoogle : t.continueApple}
    </button>
  );
}

function ShowToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <button type="button" onClick={onToggle} aria-pressed={shown} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-stone">
      {shown ? t.hidePw : t.showPw}
    </button>
  );
}

function StrengthMeter({ pw }: { pw: string }) {
  const t = useT();
  const s = strength(pw);
  const colours = ["bg-line", "bg-turmeric", "bg-saffron", "bg-cardamom"];
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="flex flex-1 gap-1">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${pw && s >= n ? colours[s] : "bg-line"}`} />
        ))}
      </span>
      <span className="min-w-[9ch] text-right" aria-live="polite">
        {t.pwStrength[s]}
      </span>
    </span>
  );
}

/** The panel beside the form: dusk outside, a warm cup inside, the shop's seal. */
function Panel() {
  const t = useT();
  const stars = Array.from({ length: 26 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 46, r: i % 3 ? 1 : 1.6, d: (i % 5) * 0.6 }));
  return (
    <aside className="relative hidden overflow-hidden rounded-[32px] bg-[linear-gradient(170deg,#141a33_0%,#2a2850_48%,#6b4a5a_100%)] p-10 text-linen lg:flex lg:flex-col">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.18} fill="#f6ecd4" className="film-star" style={{ "--d": s.d } as React.CSSProperties} />
        ))}
      </svg>
      <Seal className="relative h-24 w-24 text-linen" ring="#faf6ef" />
      <h2 className="relative mt-8 max-w-sm font-serif text-[40px] font-medium leading-[1.05] tracking-tight">{t.authPanelTitle}</h2>
      <ul className="relative mt-6 space-y-3 text-[15px] text-linen/85">
        {t.authPerks.map((p) => (
          <li key={p} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-turmeric/90 text-[11px] font-bold text-ink">
              ✓
            </span>
            {p}
          </li>
        ))}
      </ul>
      {/* the warm window: a cup of chai on the sill */}
      <div className="relative mt-auto flex justify-center pt-10">
        <div className="absolute bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,#ffcf86aa_0%,#ffcf8633_45%,transparent_70%)] blur-md" />
        <div className="relative rounded-[28px] bg-[#fff4e2]/95 p-4 shadow-[0_30px_60px_rgba(10,8,30,0.45)]">
          <ChaiStillLife className="h-[150px] w-[150px]" />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ the flow */

export function LoginView() {
  const m = useMarket();
  const t = useT();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { hydrated, user, known, register, signIn, signInWith, resetPassword } = useSession();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState<{ code: string; at: number } | null>(null);
  const [agree, setAgree] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [knownName, setKnownName] = useState("");
  const next = safeNext(useSearchParams().get("next"), `/${m.code}/account`);
  // Already signed in: nothing to do here.
  useEffect(() => {
    if (hydrated && user && step === "email") router.replace(next);
  }, [hydrated, user, step, next, router]);
  // the resend countdown
  useEffect(() => {
    if (!sent) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sent]);
  const wait = sent ? Math.max(0, 30 - Math.floor((now - sent.at) / 1000)) : 0;

  const go = (s: Step) => {
    setError(null);
    setShow(false);
    setStep(s);
  };
  const done = () => router.push(next);
  const sendCode = () => {
    setSent({ code: makeCode(), at: Date.now() });
    setNow(Date.now());
    setCode("");
  };
  // a short pause so the step change reads as "checking", not as a jump
  const pause = () => new Promise((r) => setTimeout(r, reduce ? 0 : 450));

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return setError(email ? t.invalidEmail : t.required);
    setBusy(true);
    await pause();
    setBusy(false);
    if (known(email)) {
      setKnownName(useSession.getState().accounts[email.trim().toLowerCase()]?.name ?? DEMO.name);
      go("password");
    } else go("create");
  }
  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return setError(t.required);
    setBusy(true);
    const [u] = await Promise.all([signIn(email, password), pause()]);
    setBusy(false);
    if (!u) return setError(t.wrongPw);
    done();
  }
  async function onCode(e: React.FormEvent) {
    e.preventDefault();
    if (!sent || code.replace(/\s/g, "") !== sent.code) return setError(t.wrongCode);
    setBusy(true);
    await pause();
    signInWith(email, "code");
    done();
  }
  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(t.required);
    if (strength(password) === 0) return setError(t.pwStrength[0]);
    if (!agree) return setError(t.termsRequired);
    setBusy(true);
    await Promise.all([register({ email, name, password, newsletter }), pause()]);
    done();
  }
  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    if (!sent || code.replace(/\s/g, "") !== sent.code) return setError(t.wrongCode);
    if (strength(password) === 0) return setError(t.pwStrength[0]);
    setBusy(true);
    await resetPassword(email, password);
    await signIn(email, password);
    done();
  }
  const social = (via: "google" | "apple") => {
    signInWith(DEMO.email, via);
    done();
  };

  const isCheckout = next.endsWith("/checkout");
  const anim = reduce
    ? {}
    : { initial: { opacity: 0, x: 18 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -18 }, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const } };

  const backTo = (s: Step) => (
    <button type="button" onClick={() => go(s)} className="-ml-2 mb-4 flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-ink-soft hover:bg-stone">
      <span aria-hidden="true">←</span> {t.authBack}
    </button>
  );
  const who = (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
      <span className="font-medium text-ink">{email.trim()}</span>
      <button type="button" onClick={() => (setPassword(""), go("email"))} className="font-semibold text-saffron-text hover:underline">
        {t.notYou}
      </button>
    </p>
  );

  return (
    <section className="mx-auto grid max-w-[1120px] gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:min-h-[680px] lg:grid-cols-[1fr_1.08fr] lg:gap-10">
      <Panel />

      <div className="flex flex-col justify-center lg:py-6">
        {/* phones: the seal stands in for the panel */}
        <Seal className="mb-5 h-20 w-20 text-ink lg:hidden" />
        <div className="w-full max-w-[440px]">
          <AnimatePresence mode="wait" initial={false}>
            {step === "email" ? (
              <motion.div key="email" {...anim}>
                <h1 className="font-serif text-[40px] font-medium leading-[1.05] tracking-tight sm:text-5xl">{t.authTitle}</h1>
                <p className="mt-3 text-ink-soft">{t.authSub}</p>
                <div className="mt-8 grid gap-3">
                  <Social provider="google" onClick={() => social("google")} />
                  <Social provider="apple" onClick={() => social("apple")} />
                </div>
                <p className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  <span className="h-px flex-1 bg-line" /> {t.orEmail} <span className="h-px flex-1 bg-line" />
                </p>
                <form onSubmit={onEmail} noValidate className="grid gap-4">
                  <Field label={t.email} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => (setEmail(e.target.value), setError(null))} error={error} autoFocus />
                  <Primary busy={busy}>{t.continueBtn}</Primary>
                </form>
              </motion.div>
            ) : null}

            {step === "password" ? (
              <motion.div key="password" {...anim}>
                {backTo("email")}
                <h1 className="font-serif text-[36px] font-medium leading-[1.08] tracking-tight sm:text-[44px]">{t.welcomeBack(knownName)}</h1>
                {who}
                <p className="mt-3 text-ink-soft">{t.welcomeBackSub}</p>
                <form onSubmit={onPassword} noValidate className="mt-7 grid gap-4">
                  {/* the username field lets password managers pair this login */}
                  <input type="email" autoComplete="username" value={email} readOnly hidden />
                  <Field
                    label={t.password}
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => (setPassword(e.target.value), setError(null))}
                    error={error}
                    autoFocus
                    trailing={<ShowToggle shown={show} onToggle={() => setShow((s) => !s)} />}
                  />
                  <Primary busy={busy}>{t.signIn}</Primary>
                </form>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                  <button type="button" onClick={() => (sendCode(), go("code"))} className="text-saffron-text hover:underline">
                    {t.emailCode}
                  </button>
                  <button type="button" onClick={() => (sendCode(), setPassword(""), go("reset"))} className="text-ink-soft hover:underline">
                    {t.forgotPw}
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === "code" || step === "reset" ? (
              <motion.div key={step} {...anim}>
                {backTo("password")}
                <h1 className="font-serif text-[36px] font-medium leading-[1.08] tracking-tight sm:text-[44px]">{step === "code" ? t.codeTitle : t.resetTitle}</h1>
                <p className="mt-3 text-ink-soft">{step === "code" ? t.codeSub(email.trim()) : t.resetSub(email.trim())}</p>
                {sent ? (
                  <p className="mt-4 rounded-xl bg-[#fbf0dc] px-4 py-3 text-sm text-saffron-deep" aria-live="polite">
                    {t.codeDemo(sent.code)}
                  </p>
                ) : null}
                <form onSubmit={step === "code" ? onCode : onReset} noValidate className="mt-6 grid gap-4">
                  <input type="email" autoComplete="username" value={email} readOnly hidden />
                  <Field
                    label={t.codeLabel}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => (setCode(e.target.value.replace(/\D/g, "").slice(0, 6)), setError(null))}
                    error={step === "code" ? error : error === t.wrongCode ? error : null}
                    autoFocus
                    className="tabular text-center text-[24px] tracking-[0.5em]"
                  />
                  {step === "reset" ? (
                    <Field
                      label={t.newPassword}
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => (setPassword(e.target.value), setError(null))}
                      error={error && error !== t.wrongCode ? error : null}
                      hint={<StrengthMeter pw={password} />}
                      trailing={<ShowToggle shown={show} onToggle={() => setShow((s) => !s)} />}
                    />
                  ) : null}
                  <Primary busy={busy}>{step === "code" ? t.signIn : t.savePassword}</Primary>
                </form>
                <button type="button" disabled={wait > 0} onClick={sendCode} className="mt-5 text-sm font-semibold text-saffron-text enabled:hover:underline disabled:text-ink-muted">
                  {t.resend(wait)}
                </button>
              </motion.div>
            ) : null}

            {step === "create" ? (
              <motion.div key="create" {...anim}>
                {backTo("email")}
                <h1 className="font-serif text-[36px] font-medium leading-[1.08] tracking-tight sm:text-[44px]">{t.newTitle}</h1>
                <p className="mt-3 text-ink-soft">{t.newSub(email.trim())}</p>
                <form onSubmit={onCreate} noValidate className="mt-7 grid gap-4">
                  <input type="email" autoComplete="username" value={email} readOnly hidden />
                  <Field label={t.yourName} autoComplete="given-name" value={name} onChange={(e) => (setName(e.target.value), setError(null))} error={error === t.required ? error : null} autoFocus />
                  <Field
                    label={t.newPassword}
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => (setPassword(e.target.value), setError(null))}
                    error={error === t.pwStrength[0] ? error : null}
                    hint={<StrengthMeter pw={password} />}
                    trailing={<ShowToggle shown={show} onToggle={() => setShow((s) => !s)} />}
                  />
                  <label className="flex items-start gap-3 text-sm text-ink-soft">
                    <input type="checkbox" checked={agree} onChange={(e) => (setAgree(e.target.checked), setError(null))} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-saffron)]" aria-invalid={error === t.termsRequired} />
                    <span>
                      {t.acceptTerms[0]}{" "}
                      <Link href={`/${m.code}/info/terms`} className="font-semibold text-ink underline underline-offset-2">
                        {t.acceptTerms[1]}
                      </Link>{" "}
                      {t.acceptTerms[2]}{" "}
                      <Link href={`/${m.code}/info/privacy`} className="font-semibold text-ink underline underline-offset-2">
                        {t.acceptTerms[3]}
                      </Link>
                      .
                    </span>
                  </label>
                  {error === t.termsRequired ? (
                    <p role="alert" className="-mt-2 text-sm text-chilli">
                      ⚠ {error}
                    </p>
                  ) : null}
                  <label className="flex items-start gap-3 text-sm text-ink-soft">
                    <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-saffron)]" />
                    <span>{t.newsletterOpt}</span>
                  </label>
                  <Primary busy={busy}>{t.createAccount}</Primary>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {isCheckout ? (
            <div className="mt-8 rounded-2xl border border-line bg-warm p-5">
              <p className="font-semibold">{t.guestTitle}</p>
              <p className="mt-1 text-sm text-ink-soft">{t.guestSub}</p>
              <Link href={`/${m.code}/checkout`} className="mt-3 inline-block text-sm font-semibold text-saffron-text hover:underline">
                {t.guestCta} →
              </Link>
            </div>
          ) : null}

          <p className="mt-8 text-xs leading-relaxed text-ink-muted">{t.demoLogin(DEMO.email, DEMO.password)}</p>
        </div>
      </div>
    </section>
  );
}
