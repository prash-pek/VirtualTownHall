export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: { role?: string };
    /** This user's Outset apps, copied from private metadata by the shared session token. */
    apps?: string[];
  }
}
