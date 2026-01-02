import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

type Role = "OWNER" | "ADMIN" | "CUSTOMER";

function parseEmails(v?: string) {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function resolveRoleFromEmail(email?: string | null): Role | undefined {
  const e = (email ?? "").toLowerCase();
  if (!e) return undefined;

  const owners = parseEmails(process.env.OWNER_EMAILS);
  if (owners.includes(e)) return "OWNER";

  const admins = parseEmails(process.env.ADMIN_EMAILS);
  if (admins.includes(e)) return "ADMIN";

  return undefined;
}

const hasDbUrl = !!process.env.DATABASE_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: hasDbUrl ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!hasDbUrl) return null;

        const rawUsername = credentials?.username;
        const rawPassword = credentials?.password;
        const username =
          typeof rawUsername === "string" ? rawUsername.trim() : "";
        const password = typeof rawPassword === "string" ? rawPassword : "";

        if (!username || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ username }, { email: username }],
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const emailRole = resolveRoleFromEmail(user.email);
        const role = emailRole ?? (user.role as Role) ?? "CUSTOMER";

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          image: user.image ?? undefined,
          role,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (typeof user.id === "string") {
          token.sub = user.id;
        }
        token.role = (user as any).role ?? token.role ?? "CUSTOMER";
        token.username = (user as any).username ?? token.username ?? null;
      }

      if (!token.role) token.role = "CUSTOMER";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.role = (token as any).role ?? "CUSTOMER";
        session.user.username = (token as any).username ?? null;
      }
      return session;
    },
  },
});
