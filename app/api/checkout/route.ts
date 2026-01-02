// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type CartItemLite = {
  price: number;
  quantity: number;
};

export async function POST() {
  try {
    // Tanpa DB, endpoint checkout sebaiknya balikin error yang jelas
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database belum dikonfigurasi (DATABASE_URL belum ada)." },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart kosong" }, { status: 400 });
    }

    const items = cart.items as unknown as CartItemLite[];

    const totalAmount = items.reduce<number>(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ...lanjutkan logic checkout kamu yang lain di sini (midtrans, create order, dll)

    return NextResponse.json({ ok: true, totalAmount });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
