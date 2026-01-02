// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

type Role = "OWNER" | "ADMIN" | "CUSTOMER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    username?: string | null;
  }
}
