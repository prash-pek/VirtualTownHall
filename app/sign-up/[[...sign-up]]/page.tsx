import { SignUp } from "@clerk/nextjs";
import { notFound } from "next/navigation";

import { signInUrl, signUpUrl } from "@/lib/auth/urls";
import { clerkEnabled } from "@/lib/env";

export default function SignUpPage() {
  if (!clerkEnabled()) notFound();
  return (
    <main className="flex justify-center px-4 py-16">
      <SignUp path={signUpUrl} signInUrl={signInUrl} />
    </main>
  );
}
