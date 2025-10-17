import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        dni: { label: "DNI", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { dni, password } = credentials;
        const user = await prisma.user.findUnique({ where: { dni } });
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return { id: user.id.toString(), dni: user.dni, name: user.name };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const t = token as unknown as Record<string, unknown>;
        const u = user as unknown as Record<string, unknown>;
        t["id"] = u["id"];
        t["dni"] = u["dni"];
        t["name"] = u["name"];
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const s = session as unknown as Record<string, unknown>;
        const t = token as unknown as Record<string, unknown>;
        s["user"] = { id: t["id"], dni: t["dni"], name: t["name"] };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
