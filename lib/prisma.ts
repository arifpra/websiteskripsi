// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient() {
  // Kalau DATABASE_URL belum ada, tetap bikin instance supaya build tidak berantakan.
  // Tapi kalau dipakai query saat runtime tanpa DB, akan error (itu wajar).
  return new PrismaClient();
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

// Support default import juga:
export default prisma;
