import { prisma } from "@/lib/prisma";

export const getproduks = async () => {
  try {
    const result = await prisma.produk.findMany({
      orderBy: { createdAt: "desc" },
    });
    return result;
  } catch (err) {
    console.error("Error getproduks:", err);
    return [];
  }
};

export const getprodukById = async (id: string) => {
  try {
    const produk = await prisma.produk.findUnique({
      where: { id },
    });

    return produk;
  } catch (err) {
    console.error("Error getprodukById:", err);
    return null;
  }
};

export const getAmenities = async () => {
  try {
    const result = await prisma.amenities.findMany({
      orderBy: { name: "asc" },
    });
    return result;
  } catch (err) {
    console.error("Error getAmenities:", err);
    return [];
  }
};

export const addToCart = async (
  userId: string,
  produkId: string,
  quantity = 1
) => {
  try {
    const produk = await prisma.produk.findUnique({
      where: { id: produkId },
    });

    if (!produk) {
      throw new Error("Produk tidak ditemukan");
    }

    // Pakai cast any supaya TS nggak protes
    const cartModel = (prisma as any).cart;
    const cartItemModel = (prisma as any).cartItem;

    // Cari cart existing untuk user ini
    let cart = await cartModel.findFirst({
      where: { userId },
    });

    // Kalau belum ada cart, buat baru
    if (!cart) {
      cart = await cartModel.create({
        data: { userId },
      });
    }

    // Tambah / update item di cart
    const item = await cartItemModel.upsert({
      where: {
        cartId_produkId: {
          cartId: cart.id,
          produkId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        produkId,
        quantity,
        price: produk.price,
      },
    });

    return { cart, item };
  } catch (err) {
    console.error("Error addToCart:", err);
    throw err;
  }
};

export const getReservationById = async (id: string) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        produk: true,
        user: true,
        payment: true,
      },
    });

    return reservation;
  } catch (err) {
    console.error("Error getReservationById:", err);
    return null;
  }
};

// === FUNCTION: getReservationByUserId ===
export const getReservationByUserId = async (userId: string) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        produk: true,
        user: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reservations;
  } catch (err) {
    console.error("Error getReservationByUserId:", err);
    return [];
  }
};

export const getprodukDetailById = async (id: string) => {
  try {
    const produk = await prisma.produk.findUnique({
      where: { id },
      include: {
        produkAmenities: {
          include: {
            amenities: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return produk;
  } catch (err) {
    console.error("Error getprodukDetailById:", err);
    return null;
  }
};

export const getReservationByprodukId = async (produkId: string) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { produkId },
      select: {
        starDate: true,
        endDate: true,
      },
    });

    return reservations;
  } catch (err) {
    console.error("Error getReservationByprodukId:", err);
    return [];
  }
};
