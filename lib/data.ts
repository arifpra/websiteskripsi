// lib/data.ts
import { prisma } from "@/lib/prisma";

export const getproduks = async () => {
  try {
    if (!process.env.DATABASE_URL) return []; // fallback tanpa DB
    return await prisma.produk.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error getproduks:", error);
    return [];
  }
};

export const getprodukById = async (id: string) => {
  try {
    if (!process.env.DATABASE_URL) return null; // fallback tanpa DB
    return await prisma.produk.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error getprodukById:", error);
    return null;
  }
};
