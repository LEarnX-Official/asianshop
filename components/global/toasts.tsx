"use client";

import { useEffect, useRef, useState } from "react";
import { useBasket, type Toast } from "@/lib/basket";
import { useT } from "./market-context";

function ToastItem({ toast }: { toast: Toast }) {
  const t = useT();
  const dismiss = useBasket((s) => s.dismissToast);
  const openDrawer = useBasket((s) => s.openDrawer);
  const [paused, setPaused] = useState(false);
  const left = useRef(4000);
  const started = useRef(0);
  useEffect(() => {
    if (paused) return;
    started.current = Date.now();
    const id = setTimeout(() => dismiss(toast.id), left.current);
    return () => {
      clearTimeout(id);
      left.current -= Date.now() - started.current;
    };
  }, [paused, dismiss, toast.id]);
  return (
    <div
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="toast-in pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-linen shadow-lift"
    >
      <span className="min-w-0 flex-1 truncate">{toast.text}</span>
      {toast.kind !== "removed" ? (
        <button type="button" onClick={() => (openDrawer(true), dismiss(toast.id))} className="shrink-0 font-semibold text-turmeric hover:underline">
          {t.viewBasket}
        </button>
      ) : null}
      {toast.undo ? (
        <button type="button" onClick={() => (toast.undo?.(), dismiss(toast.id))} className="shrink-0 font-semibold text-turmeric hover:underline">
          {t.undo}
        </button>
      ) : null}
    </div>
  );
}

/** A12 Toast: 4 s, pauses on hover/focus, at most 2 stacked (Script S9.3). */
export function Toasts() {
  const toasts = useBasket((s) => s.toasts);
  const drawerOpen = useBasket((s) => s.drawerOpen);
  if (drawerOpen) return null; // the open basket is its own confirmation; never cover its checkout button
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px] sm:items-stretch">
      {toasts.map((x) => (
        <ToastItem key={x.id} toast={x} />
      ))}
    </div>
  );
}
