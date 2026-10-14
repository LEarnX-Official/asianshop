"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { money, priceOf } from "@/lib/format";
import { basketTotal, useBasket } from "@/lib/basket";
import { useOrders } from "@/lib/orders";
import { POSTCODE, arrivalRange, dayLabel, deliveryMethods, deliveryPrice, paymentMethods } from "@/lib/delivery";
import { useMarket, useT } from "../global/market-context";
import { PackImage } from "../product/pack-image";
import { useSession } from "@/lib/session";

type Step = 0 | 1 | 2 | 3;
const LOCKERS: Record<string, string[]> = {
  PL: ["KRA01M · ul. Długa 12", "KRA55A · ul. Karmelicka 30", "KRA210 · Rondo Mogilskie (Galeria)"],
  DE: [],
};

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  inputMode,
  half,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "numeric" | "text";
  half?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const show = touched && error;
  return (
    <label htmlFor={id} className={`flex flex-col gap-1.5 ${half ? "" : "sm:col-span-2"}`}>
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={!!show}
        aria-describedby={show ? `${id}-err` : undefined}
        className={`h-12 rounded-xl border bg-warm px-4 text-[16px] outline-none transition-colors focus:border-ink ${show ? "border-chilli" : "border-line"}`}
      />
      {show ? (
        <span id={`${id}-err`} className="flex items-center gap-1 text-sm text-chilli">
          <span aria-hidden="true">⚠</span> {error}
        </span>
      ) : null}
    </label>
  );
}

function Section({
  n,
  title,
  open,
  done,
  summary,
  onEdit,
  children,
}: {
  n: number;
  title: string;
  open: boolean;
  done: boolean;
  summary?: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  const t = useT();
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (open && n > 1) head.current?.focus();
  }, [open, n]);
  return (
    <section className={`rounded-[var(--radius-card)] border bg-warm ${open ? "border-ink/20 shadow-lift" : "border-line"}`}>
      <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${done && !open ? "bg-cardamom text-white" : open ? "bg-ink text-linen" : "bg-stone text-ink-muted"}`}>
          {done && !open ? "✓" : n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 ref={head} tabIndex={-1} className="text-lg font-semibold outline-none">
            {title}
          </h2>
          {!open && done && summary ? <div className="truncate text-sm text-ink-muted">{summary}</div> : null}
        </div>
        {!open && done ? (
          <button type="button" onClick={onEdit} className="text-sm font-semibold text-saffron-text hover:underline">
            {t.edit}
          </button>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 sm:px-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

/** S11–S12: calm one-page checkout. A locked-off shot: nothing decorative moves. */
export function CheckoutView() {
  const m = useMarket();
  const t = useT();
  const router = useRouter();
  const lines = useBasket((s) => s.lines);
  const order = useBasket((s) => s.order);
  const hydrated = useBasket((s) => s.hydrated);
  const place = useOrders((s) => s.place);
  const [step, setStep] = useState<Step>(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [addr, setAddr] = useState({ firstName: "", lastName: "", street: "", postcode: "", city: "" });
  const methods = deliveryMethods(m);
  const [deliveryId, setDeliveryId] = useState(methods[0].id);
  const [locker, setLocker] = useState(LOCKERS[m.country][0] ?? "");
  const pays = paymentMethods(m);
  const [payId, setPayId] = useState(pays[0].id);
  const [blik, setBlik] = useState("");
  const [agree, setAgree] = useState(false);
  // a signed-in shopper starts with their email and name filled in (once, when the session loads)
  const user = useSession((st) => (st.hydrated ? st.user : null));
  const [prefilled, setPrefilled] = useState<string | null>(null);
  if (user && prefilled !== user.email) {
    setPrefilled(user.email);
    setContact((c) => (c.email ? c : { ...c, email: user.email }));
    setAddr((x) => (x.firstName ? x : { ...x, firstName: user.name }));
  }
  const [paying, setPaying] = useState<"idle" | "paying" | "failed">("idle");
  const [slow, setSlow] = useState(false);

  const items = order.map((id) => lines[id]).filter(Boolean);
  const subtotal = basketTotal(lines, m.currency);
  const method = methods.find((x) => x.id === deliveryId)!;
  const dCost = deliveryPrice(method, subtotal, m);
  const total = subtotal + dCost;
  const [a, b] = arrivalRange(method);
  const arrive = method.days[0] === method.days[1] ? t.arrives(dayLabel(a, m)) : t.arrivesBetween(dayLabel(a, m), dayLabel(b, m));

  const errs = useMemo(() => {
    const pc = POSTCODE[m.country];
    return {
      email: !contact.email ? t.required : /^\S+@\S+\.\S+$/.test(contact.email) ? null : t.invalidEmail,
      phone: contact.phone.replace(/\D/g, "").length >= 9 ? null : t.required,
      firstName: addr.firstName.trim() ? null : t.required,
      lastName: addr.lastName.trim() ? null : t.required,
      street: addr.street.trim() ? null : t.required,
      postcode: !addr.postcode ? t.required : pc.re.test(addr.postcode.trim()) ? null : t.invalidPostcode(pc.fmt),
      city: addr.city.trim() ? null : t.required,
    };
  }, [contact, addr, m.country, t]);
  const contactOk = !errs.email && !errs.phone;
  const addressOk = method.kind === "pickup" || (!errs.firstName && !errs.lastName && !errs.street && !errs.postcode && !errs.city);
  const payOk = payId !== "blik" || /^\d{6}$/.test(blik);

  const complete = (s: number, next: Step) => {
    setDone((d) => new Set(d).add(s));
    setStep(next);
  };

  const pay = () => {
    if (!agree || paying === "paying") return;
    setPaying("paying");
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 8000);
    setTimeout(() => {
      clearTimeout(slowTimer);
      if (payId === "blik" && blik === "000000") {
        setPaying("failed");
        return;
      }
      const placed = place({
        market: m.code,
        currency: m.currency,
        lines: items.map((l) => ({ product: l.product, qty: l.qty, price: priceOf(l.product, m) })),
        subtotal,
        deliveryCost: dCost,
        total,
        delivery: { id: method.id, label: method.kind === "locker" && locker ? `${method.label} · ${locker}` : method.label, arrive: [a.toISOString(), b.toISOString()] },
        payment: pays.find((x) => x.id === payId)!.label,
        address: { ...addr, country: m.country, ...contact },
      });
      useBasket.setState({ lines: {}, order: [] });
      router.push(`/${m.code}/order/${placed.id}`);
    }, 1600);
  };

  if (hydrated && !items.length) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <p className="font-serif text-3xl">{t.checkoutEmpty}</p>
        <Link href={`/${m.code}`} className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-linen">
          {t.backToShop}
        </Link>
      </div>
    );
  }

  const radio = (active: boolean) =>
    `flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors ${active ? "border-ink bg-stone/60" : "border-line hover:border-ink-muted/50"}`;
  const dot = (active: boolean) => (
    <span aria-hidden="true" className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? "border-ink" : "border-line"}`}>
      {active ? <span className="h-2.5 w-2.5 rounded-full bg-ink" /> : null}
    </span>
  );

  const summary = (
    <div className="rounded-[var(--radius-card)] border border-line bg-warm p-5">
      <h2 className="text-lg font-semibold">{t.orderSummary}</h2>
      <ul className="mt-4 max-h-[42vh] space-y-3 overflow-y-auto pr-1">
        {items.map(({ product: p, qty }) => (
          <li key={p.id} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <PackImage src={p.image} alt="" brand={p.brand} className="h-14 w-14 rounded-lg" sizes="56px" />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-semibold text-linen">{qty}</span>
            </div>
            <span className="min-w-0 flex-1 truncate text-sm">{p.title[m.lang]}</span>
            <span className="tabular text-sm font-medium">{money(priceOf(p, m) * qty, m)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">{t.subtotal}</dt>
          <dd className="tabular">{money(subtotal, m)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">{t.deliveryCost}</dt>
          <dd className="tabular">
            <motion.span key={dCost} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
              {dCost === 0 ? t.free : money(dCost, m)}
            </motion.span>
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>{t.total}</dt>
          <dd className="tabular text-xl">{money(total, m)}</dd>
        </div>
      </dl>
      <p className="mt-1 text-xs text-ink-muted">{t.vatIncluded}</p>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
        <span aria-hidden="true">✋</span> {t.packedByHand}
      </p>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-[1100px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
      <details className="rounded-2xl border border-line bg-warm px-4 py-3 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
          <span>
            {t.itemsCount(items.reduce((n, l) => n + l.qty, 0))} · {money(total, m)}
          </span>
          <span aria-hidden="true">▾</span>
        </summary>
        <div className="mt-3">{summary}</div>
      </details>

      <div className="flex flex-col gap-4">
        <Section n={1} title={t.stepContact} open={step === 0} done={done.has(0)} summary={`${contact.email} · ${contact.phone}`} onEdit={() => setStep(0)}>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (contactOk) complete(0, 1);
            }}
          >
            {!user ? (
              <p className="text-sm text-ink-soft sm:col-span-2">
                <Link href={`/${m.code}/login?next=${encodeURIComponent(`/${m.code}/checkout`)}`} className="font-semibold text-saffron-text hover:underline">
                  {t.checkoutSignIn} →
                </Link>
              </p>
            ) : null}
            <Field id="email" label={t.email} type="email" inputMode="email" autoComplete="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} error={errs.email} half />
            <Field id="phone" label={t.phone} type="tel" inputMode="tel" autoComplete="tel" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} error={errs.phone} half />
            <button type="submit" disabled={!contactOk} className="h-12 rounded-full bg-ink text-sm font-semibold text-linen disabled:bg-line disabled:text-ink-muted sm:col-span-2 sm:w-48">
              {t.continueBtn}
            </button>
          </form>
        </Section>

        <Section n={2} title={t.stepDelivery} open={step === 1} done={done.has(1)} summary={`${method.label} · ${arrive}`} onEdit={() => setStep(1)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (addressOk) complete(1, 2);
            }}
          >
            <fieldset>
              <legend className="mb-3 font-medium">{t.deliveryMethod}</legend>
              <div className="flex flex-col gap-2">
                {methods.map((x) => {
                  const price = deliveryPrice(x, subtotal, m);
                  const [d1, d2] = arrivalRange(x);
                  const when = x.days[0] === x.days[1] ? t.arrives(dayLabel(d1, m)) : t.arrivesBetween(dayLabel(d1, m), dayLabel(d2, m));
                  return (
                    <button key={x.id} type="button" role="radio" aria-checked={x.id === deliveryId} onClick={() => setDeliveryId(x.id)} className={radio(x.id === deliveryId)}>
                      {dot(x.id === deliveryId)}
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{x.label}</span>
                        <span className="block text-sm text-cardamom">{x.kind === "pickup" ? t.pickupReady : when}</span>
                      </span>
                      <span className="tabular font-semibold">{price === 0 ? t.free : money(price, m)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {method.kind === "locker" && LOCKERS[m.country].length ? (
              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">{t.pickLocker}</span>
                <select value={locker} onChange={(e) => setLocker(e.target.value)} className="h-12 rounded-xl border border-line bg-warm px-3">
                  {LOCKERS[m.country].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
            ) : null}
            {method.kind !== "pickup" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field id="fn" label={t.firstName} autoComplete="given-name" value={addr.firstName} onChange={(v) => setAddr({ ...addr, firstName: v })} error={errs.firstName} half />
                <Field id="ln" label={t.lastName} autoComplete="family-name" value={addr.lastName} onChange={(v) => setAddr({ ...addr, lastName: v })} error={errs.lastName} half />
                <Field id="st" label={t.street} autoComplete="address-line1" value={addr.street} onChange={(v) => setAddr({ ...addr, street: v })} error={errs.street} />
                <Field id="pc" label={t.postcode} autoComplete="postal-code" inputMode="numeric" value={addr.postcode} onChange={(v) => setAddr({ ...addr, postcode: v })} error={errs.postcode} half />
                <Field id="ct" label={t.city} autoComplete="address-level2" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} error={errs.city} half />
                <p className="text-sm text-ink-muted sm:col-span-2">
                  {t.country}: <span className="font-medium text-ink">{m.countryName[m.lang]}</span>
                </p>
              </div>
            ) : null}
            <button type="submit" disabled={!addressOk} className="mt-5 h-12 w-full rounded-full bg-ink text-sm font-semibold text-linen disabled:bg-line disabled:text-ink-muted sm:w-48">
              {t.continueBtn}
            </button>
          </form>
        </Section>

        <Section n={3} title={t.stepPayment} open={step === 2} done={done.has(2)} summary={pays.find((x) => x.id === payId)?.label} onEdit={() => setStep(2)}>
          <fieldset>
            <legend className="mb-3 font-medium">{t.paymentMethod}</legend>
            <div className="flex flex-col gap-2">
              {pays.map((x) => (
                <button key={x.id} type="button" role="radio" aria-checked={x.id === payId} onClick={() => setPayId(x.id)} className={radio(x.id === payId)}>
                  {dot(x.id === payId)}
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{x.label}</span>
                    {x.hint ? <span className="block text-sm text-ink-muted">{x.hint}</span> : null}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          {payId === "blik" ? (
            <label className="mt-4 flex max-w-xs flex-col gap-1.5">
              <span className="text-sm font-medium text-ink-soft">{t.blikCode}</span>
              <input
                value={blik}
                onChange={(e) => setBlik(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000 000"
                className="tabular h-14 rounded-xl border border-line bg-warm px-4 text-2xl tracking-[0.3em] outline-none focus:border-ink"
              />
              <span className="text-sm text-ink-muted">{t.blikHint}</span>
            </label>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">{t.redirectNote}</p>
          )}
          <button type="button" disabled={!payOk} onClick={() => complete(2, 3)} className="mt-5 h-12 w-full rounded-full bg-ink text-sm font-semibold text-linen disabled:bg-line disabled:text-ink-muted sm:w-48">
            {t.continueBtn}
          </button>
        </Section>

        <Section n={4} title={t.stepReview} open={step === 3} done={false} onEdit={() => setStep(3)}>
          <div className="rounded-xl bg-stone/60 p-4 text-sm leading-relaxed">
            <p>
              <span className="font-medium">{method.label}</span> · {arrive}
            </p>
            {method.kind !== "pickup" ? (
              <p className="text-ink-soft">
                {addr.firstName} {addr.lastName}, {addr.street}, {addr.postcode} {addr.city}, {m.countryName[m.lang]}
              </p>
            ) : null}
            <p className="text-ink-soft">{pays.find((x) => x.id === payId)?.label}</p>
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#1f1a17]" />
            <span>
              {t.agreeTerms}{" "}
              <Link href={`/${m.code}/info/terms`} className="underline underline-offset-2">
                {t.infoNav.terms}
              </Link>{" "}
              ·{" "}
              <Link href={`/${m.code}/info/privacy`} className="underline underline-offset-2">
                {t.infoNav.privacy}
              </Link>
            </span>
          </label>
          {paying === "failed" ? (
            <p role="alert" className="mt-4 rounded-xl border border-chilli/30 bg-chilli/5 px-4 py-3 text-sm text-chilli">
              {t.payFailed}
            </p>
          ) : null}
          <button
            type="button"
            onClick={pay}
            disabled={!agree}
            className="relative mt-5 flex h-14 w-full items-center justify-center overflow-hidden rounded-full bg-saffron text-base font-semibold text-white transition-colors hover:bg-saffron-deep disabled:bg-line disabled:text-ink-muted"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={paying === "paying" ? "p" : "i"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {paying === "paying" ? t.packing : t.pay(money(total, m))}
              </motion.span>
            </AnimatePresence>
            {paying === "paying" ? <span aria-hidden="true" className="pay-progress absolute inset-x-0 bottom-0 h-[3px] bg-white/70" /> : null}
          </button>
          {slow ? <p className="mt-2 text-sm text-ink-muted">{t.stillWorking}</p> : null}
          <p className="mt-3 text-xs text-ink-muted">{t.demoPayNote}</p>
        </Section>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24">{summary}</div>
      </aside>
    </div>
  );
}
