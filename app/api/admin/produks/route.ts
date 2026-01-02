// app/api/admin/produks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

// GET /api/admin/produks  → ambil semua produk
export async function GET() {
  try {
    const produks = await prisma.produk.findMany({
      orderBy: { createdAt: "desc" },
    });

    // kalau sukses, kirim list produk
    return NextResponse.json(produks, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/produks error:", error);

    // ⚠️ PENTING: jangan kirim 500 lagi, kirim array kosong + 200
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/admin/produks  → tambah produk
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
      return NextResponse.json(
        { message: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const priceRaw = formData.get("price") as string | null;
    const capacityRaw = formData.get("capacity") as string | null;
    const file = formData.get("image") as File | null;

    if (!name || !priceRaw) {
      return NextResponse.json(
        { message: "Nama dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const priceClean = priceRaw.replace(/[^\d]/g, "");
    const price = Number.parseInt(priceClean, 10);
    if (Number.isNaN(price)) {
      return NextResponse.json(
        { message: "Format harga tidak valid" },
        { status: 400 }
      );
    }

    const capacity = capacityRaw
      ? Math.max(1, Number.parseInt(capacityRaw, 10) || 1)
      : 1;

    let imagePath = "/hero.jpg";

    if (file && file.size > 0) {
      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const filename = `${Date.now()}-${safeName}`;
      const blob = await put(filename, file, {
        access: "public",
        multipart: true,
      });
      imagePath = blob.url;
    }

    const produk = await prisma.produk.create({
      data: {
        name,
        description: description ?? "",
        image: imagePath,
        price,
        capacity,
      },
    });

    return NextResponse.json(produk, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/produks error:", error);
    return NextResponse.json(
      { message: error?.message || "Gagal menambahkan produk" },
      { status: 500 }
    );
  }
}
