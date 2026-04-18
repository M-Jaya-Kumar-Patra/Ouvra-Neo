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
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id!;
      token.fullName = user.fullName; // No 'as any' needed!
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.fullName = token.fullName as string; // No 'as any' needed!
    }
    return session;
  },
},
});