import { withBasePath } from "@/lib/base-path";

/** Clerk needs full paths (including basePath) for its hosted-in-app pages and redirects. */
export const signInUrl = withBasePath("/sign-in");
export const signUpUrl = withBasePath("/sign-up");
export const afterAuthUrl = withBasePath("/");
