import NextAuth, { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extends the built-in session.user object
   */
  interface Session {
    user: {
      id: string;
      fullName?: string;
      balance: number;
      is2FAEnabled: boolean;
      is2FAVerified: boolean;
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in user object from MongoDB/Adapter
   */
  interface User {
    id?: string;
    fullName?: string;
    is2FAEnabled: boolean; // Added this so auth.ts can read it from the DB
  }
}

declare module "next-auth/jwt" {
  /** * Extends the JWT token to store 2FA state 
   */
  interface JWT {
    id: string;
    fullName?: string;
    is2FAEnabled: boolean;  // Added for middleware access
    is2FAVerified: boolean; // Added for middleware access
  }
}