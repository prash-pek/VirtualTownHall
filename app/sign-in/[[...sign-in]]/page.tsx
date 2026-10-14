import { SignIn } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import { signInUrl, signUpUrl } from "@/lib/auth/urls";
import { clerkEnabled } from "@/lib/env";

export default function SignInPage() {
  if (!clerkEnabled()) notFound();
  return (
    <main className="flex justify-center px-4 py-16">
      <SignIn path={signInUrl} signUpUrl={signUpUrl} />
    </main>
  );
}
