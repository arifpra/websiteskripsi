// app/api/admin/produks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { del, put } from "@vercel/blob";

export const runtime = "nodejs";

// Util: ambil ID dari URL dengan aman
function getIdFromRequest(req: NextRequest): string {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean); // ["api","admin","produks","<id>"]
  return parts[parts.length - 1] || "";
}

// ========== GET DETAIL ==========
export async function GET(req: NextRequest) {
  try {
    const id = getIdFromRequest(req);

    if (!id) {
      return NextResponse.json(
        { message: "ID produk tidak ditemukan di URL" },
        { status: 400 }
      );
    }

    const produk = await prisma.produk.findUnique({
      where: { id },
    });

    if (!produk) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(produk, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/produks/[id] error:", error);
    return NextResponse.json(
      { message: error?.message || "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

// ========== PATCH / UPDATE ==========
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
      return NextResponse.json(
        { message: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const id = getIdFromRequest(req);

    if (!id) {
      return NextResponse.json(
        { message: "ID produk tidak ditemukan di URL" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const priceRaw = formData.get("price") as string | null;
    const capacityRaw = formData.get("capacity") as string | null;
    const file = formData.get("image") as File | null;

    // parsing harga
    let price: number | undefined;
    if (priceRaw) {
      const clean = priceRaw.replace(/[^\d]/g, "");
      const parsed = Number.parseInt(clean, 10);
      if (!Number.isNaN(parsed)) {
        price = parsed;
      }
    }

    // parsing kapasitas
    let capacity: number | undefined;
    if (capacityRaw) {
      const parsed = Number.parseInt(capacityRaw, 10);
      if (!Number.isNaN(parsed)) {
        capacity = parsed;
      }
    }

    // upload gambar baru (opsional)
    let imagePath: string | undefined;
    let previousImage: string | null = null;
    if (file && file.size > 0) {
      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const filename = `${Date.now()}-${safeName}`;
      const blob = await put(filename, file, {
        access: "public",
        multipart: true,
      });
      imagePath = blob.url;

      const existing = await prisma.produk.findUnique({
        where: { id },
        select: { image: true },
      });
      previousImage = existing?.image ?? null;
    }

    const updated = await prisma.produk.update({
      where: { id },
      data: {
        ...(name !== null && { name }),
        ...(description !== null && { description }),
        ...(price !== undefined && { price }),
        ...(capacity !== undefined && { capacity }),
        ...(imagePath && { image: imagePath }),
      },
    });

    if (
      previousImage &&
      previousImage.startsWith("http") &&
      previousImage !== imagePath
    ) {
      await del(previousImage).catch((cleanupError) => {
        console.error("DELETE old image error:", cleanupError);
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/admin/produks/[id] error:", error);
    return NextResponse.json(
      { message: error?.message || "Gagal mengupdate produk" },
      { status: 500 }
    );
  }
}

// ========== DELETE ==========
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
      return NextResponse.json(
        { message: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const id = getIdFromRequest(req);

    if (!id) {
      return NextResponse.json(
        { message: "ID produk tidak ditemukan di URL" },
        { status: 400 }
      );
    }

    const existing = await prisma.produk.findUnique({
      where: { id },
      select: { image: true },
    });

    await prisma.produk.delete({
      where: { id },
    });

    if (existing?.image && existing.image.startsWith("http")) {
      await del(existing.image).catch((cleanupError) => {
        console.error("DELETE image error:", cleanupError);
      });
    }

    return NextResponse.json(
      { message: "Produk berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/admin/produks/[id] error:", error);
    return NextResponse.json(
      { message: error?.message || "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
