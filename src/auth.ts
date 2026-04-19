import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db/mongodb-client"; // We'll create this next
import bcrypt from "bcrypt";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID, 
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        
        const user = await User.findOne({ email: credentials?.email });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        return isValid ? user : null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET, // REQUIRED for middleware to read the token
  pages: {
    signIn: "/login", // Tells NextAuth that /login is your custom auth page
  },
callbacks: {
  async jwt({ token, user, trigger, session }) {
    // Initial sign in
    if (user) {
      token.id = user.id!;
      token.fullName = (user as any).fullName;
      token.is2FAEnabled = (user as any).is2FAEnabled || false;
      token.is2FAVerified = false; // Always starts false on new login
    }

    // Handle session updates (Optional: for when the user enables 2FA without logging out)
    if (trigger === "update" && session) {
      token.is2FAVerified = session.is2FAVerified;
    }

    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id;
      session.user.fullName = token.fullName as string;
      session.user.is2FAEnabled = token.is2FAEnabled as boolean; // ADD THIS
      session.user.is2FAVerified = token.is2FAVerified as boolean;
    }
    return session;
  },
},
});