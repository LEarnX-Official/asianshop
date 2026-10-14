import { Suspense } from "react";
import { LoginView } from "@/components/account/login-view";

export const metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  // LoginView reads ?next= (where to return after signing in), so it renders inside a Suspense boundary
  return (
    <Suspense fallback={<div className="min-h-[680px]" />}>
      <LoginView />
    </Suspense>
  );
}
