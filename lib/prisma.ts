import { PrismaClient } from "@prisma/client";

const DISABLE_DB = process.env.DISABLE_DB === "1" || process.env.DISABLE_DB === "true";
const hasDbUrl = !!process.env.DATABASE_URL;

// Mock prisma minimal: supaya route/page yang manggil prisma tidak crash saat DB dimatikan.
function createMockPrisma() {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      // prisma.$transaction / prisma.$connect / prisma.$disconnect
      if (typeof prop === "string" && prop.startsWith("$")) {
        return async () => undefined;
      }

      // prisma.user / prisma.produk / prisma.orders / dsb
      return new Proxy(
        {},
        {
          get(_t2, method) {
            // query yang umum dipakai
            if (method === "findMany") return async () => [];
            if (method === "findUnique") return async () => null;
            if (method === "findFirst") return async () => null;
            if (method === "count") return async () => 0;

            // create/update/delete: balikin object minimal agar tidak meledak
            if (method === "create" || method === "update" || method === "upsert")
              return async (args?: any) => ({ id: "mock", ...(args?.data ?? {}) });
            if (method === "delete") return async () => ({ id: "mock" });

            // default fallback
            return async () => null;
          }
        }
      );
    }
  };

  return new Proxy({}, handler);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let prismaInstance: any;

if (DISABLE_DB || !hasDbUrl) {
  prismaInstance = createMockPrisma();
} else {
  prismaInstance = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
}

/**
 * ✅ Kompatibilitas:
 * - Banyak file lama pakai: import { prisma } from "@/lib/prisma"
 * - Sebagian bisa pakai: import prisma from "@/lib/prisma"
 */
export const prisma = prismaInstance;
export default prismaInstance;
