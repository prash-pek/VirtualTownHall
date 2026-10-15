/**
 * The app is served under /townhallai, both on townhallai.outsetinno.com and when proxied from
 * outsetinno.com/townhallai. next/link and route handlers add it automatically; raw URLs
 * (plain <img>, fetch to our own API, Clerk redirect URLs) must use withBasePath().
 */
export const basePath = "/townhallai";

export function withBasePath(path: `/${string}`): string {
  return `${basePath}${path}`;
}
