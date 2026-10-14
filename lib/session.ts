"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Prototype sign-in, kept on this device (no backend yet). Passwords are stored only as a SHA-256 hash,
// but this is still a demo: the real platform signs in on the server and never keeps credentials in the browser.

export type User = { name: string; email: string; via: "password" | "code" | "google" | "apple" };
type Account = { name: string; hash: string; newsletter: boolean; createdAt: string };

/** The demo shopper, so the account pages can be tried straight away. */
export const DEMO = { email: "demo@asianshop.pl", password: "chai-masala", name: "Priya" };

type State = {
  user: User | null;
  accounts: Record<string, Account>;
  hydrated: boolean;
  known: (email: string) => boolean;
  register: (a: { email: string; name: string; password: string; newsletter: boolean }) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signInWith: (email: string, via: User["via"], name?: string) => User;
  resetPassword: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const norm = (e: string) => e.trim().toLowerCase();
async function hash(password: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`asianshop:${password}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const useSession = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: {},
      hydrated: false,
      known: (email) => norm(email) === DEMO.email || norm(email) in get().accounts,
      register: async ({ email, name, password, newsletter }) => {
        const e = norm(email);
        const account = { name: name.trim(), hash: await hash(password), newsletter, createdAt: new Date().toISOString() };
        const user: User = { name: account.name, email: e, via: "password" };
        set((s) => ({ accounts: { ...s.accounts, [e]: account }, user }));
        return user;
      },
      signIn: async (email, password) => {
        const e = norm(email);
        const h = await hash(password);
        const a = get().accounts[e];
        const ok = a ? a.hash === h : e === DEMO.email && password === DEMO.password;
        if (!ok) return null;
        const user: User = { name: a?.name ?? DEMO.name, email: e, via: "password" };
        set({ user });
        return user;
      },
      signInWith: (email, via, name) => {
        const e = norm(email);
        const user: User = { name: name ?? get().accounts[e]?.name ?? (e === DEMO.email ? DEMO.name : e.split("@")[0]), email: e, via };
        set({ user });
        return user;
      },
      resetPassword: async (email, password) => {
        const e = norm(email);
        const h = await hash(password);
        set((s) => {
          const prev = s.accounts[e] ?? { name: e === DEMO.email ? DEMO.name : e.split("@")[0], newsletter: false, createdAt: new Date().toISOString() };
          return { accounts: { ...s.accounts, [e]: { ...prev, hash: h } } };
        });
      },
      signOut: () => set({ user: null }),
    }),
    {
      name: "asianshop-session",
      partialize: (s) => ({ user: s.user, accounts: s.accounts }),
      skipHydration: true,
      onRehydrateStorage: () => () => useSession.setState({ hydrated: true }),
    },
  ),
);

/** A 6-digit sign-in code. In the prototype it is shown on screen instead of being emailed. */
export const makeCode = () => String(Math.floor(100000 + Math.random() * 900000));

/** Rough password strength for the hint under the field: 0 weak … 3 strong. */
export function strength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 8) return 0;
  let s = 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 14) s = Math.min(3, s + 1);
  return Math.min(3, s) as 0 | 1 | 2 | 3;
}

/** Only same-site paths are accepted as a place to return to after signing in. */
export function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
