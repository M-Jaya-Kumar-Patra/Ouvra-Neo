import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      async authorize() {
        return null; // ⚠️ not used in middleware
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};