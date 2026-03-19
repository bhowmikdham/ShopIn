import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyFirebaseToken, isFirebaseConfigured } from "./firebase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Try Firebase token verification first
  const authHeader = opts.req.headers.authorization;
  if (isFirebaseConfigured() && authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.slice(7);
    const decoded = await verifyFirebaseToken(idToken);
    if (decoded) {
      user = {
        openId: decoded.uid,
        name: decoded.name || decoded.email || null,
        email: decoded.email || null,
        loginMethod: 'firebase',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      return { req: opts.req, res: opts.res, user };
    }
  }

  // Fall back to original Manus OAuth
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
