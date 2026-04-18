import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `auth`, contains the session data.
   */
  interface Session {
    user: {
      id: string;
      fullName?: string;
      balance: number;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object from your MongoDB
   */
  interface User {
    id?: string;
    fullName?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    id: string;
    fullName?: string;
  }
}