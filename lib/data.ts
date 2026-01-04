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

export const getAmenities = async () => {
  try {
    if (!process.env.DATABASE_URL) return []; // fallback tanpa DB
    return await prisma.amenities.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error getAmenities:", error);
    return [];
  }
};

export const getprodukDetailById = async (id: string) => {
  try {
    if (!process.env.DATABASE_URL) return null; // fallback tanpa DB
    return await prisma.produk.findUnique({
      where: { id },
      include: {
        amenities: {
          include: {
            amenities: {
              select: { name: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error getprodukDetailById:", error);
    return null;
  }
};

export const getReservationByprodukId = async (produkId: string) => {
  try {
    if (!process.env.DATABASE_URL) return []; // fallback tanpa DB
    return await prisma.reservation.findMany({
      where: { produkId },
      select: { starDate: true, endDate: true },
    });
  } catch (error) {
    console.error("Error getReservationByprodukId:", error);
    return [];
  }
};

export const getReservationById = async (id: string) => {
  try {
    if (!process.env.DATABASE_URL) return null; // fallback tanpa DB
    return await prisma.reservation.findUnique({
      where: { id },
      include: {
        produk: {
          select: {
            name: true,
            image: true,
            price: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
      },
    });
  } catch (error) {
    console.error("Error getReservationById:", error);
    return null;
  }
};
