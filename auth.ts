// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

type Role = "ADMIN" | "OWNER" | "CUSTOMER";

const DISABLE_DB = process.env.DISABLE_DB === "1" || process.env.DISABLE_DB === "true";

function envUser(role: "ADMIN" | "OWNER") {
  const username = process.env[`${role}_USERNAME`];
  const password = process.env[`${role}_PASSWORD`];
  if (!username || !password) return null;
  return { username, password, role };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },

  // aman kalau kamu akses via domain Vercel / proxy
  trustHost: true,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string" ? credentials.username.trim() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!username || !password) {
          throw new Error("Username dan password wajib diisi");
        }

        // ✅ MODE TANPA DB: login via ENV (ADMIN / OWNER)
        if (DISABLE_DB) {
          const admin = envUser("ADMIN");
          if (admin && username === admin.username && password === admin.password) {
            return {
              id: "env-admin",
              name: "Admin",
              email: "admin@local",
              username: admin.username,
              role: "ADMIN" as Role
            };
          }

          const owner = envUser("OWNER");
          if (owner && username === owner.username && password === owner.password) {
            return {
              id: "env-owner",
              name: "Owner",
              email: "owner@local",
              username: owner.username,
              role: "OWNER" as Role
            };
          }

          throw new Error("Username atau password salah");
        }

        // ✅ MODE NORMAL: pakai DB Prisma
        const user = await prisma.user.findUnique({
          where: { username }
        });

        if (!user) {
          throw new Error("Username atau password salah");
        }

        // kalau di DB password sudah hash
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Username atau password salah");
        }

        const role = user.role as Role;

        return {
          id: user.id,
          name: user.name ?? user.username,
          email: user.email,
          username: user.username,
          role
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.role = (user as any).role as Role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).role = token.role as Role;
      }
      return session;
    }
  }
});
