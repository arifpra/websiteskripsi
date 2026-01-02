// app/api/admin/Produks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const produks = await prisma.produk.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(produks);
  } catch (error) {
    console.error("GET /api/admin/Produks error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data Produk" },
      { status: 500 }
    );
  }
}

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

    if (!name || !description || !priceRaw) {
      return NextResponse.json(
        { message: "Nama, deskripsi, dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const priceClean = priceRaw.replace(/[^\d]/g, "");
    const priceNumber = Number.parseInt(priceClean, 10);
    if (Number.isNaN(priceNumber)) {
      return NextResponse.json(
        { message: "Format harga tidak valid" },
        { status: 400 }
      );
    }

    const capacityNumber = capacityRaw
      ? Math.max(1, Number.parseInt(capacityRaw, 10) || 1)
      : 1;

    let imagePath = "/uploads/default-produk.jpg";

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const fileName = `${Date.now()}-${safeName}`;
      const fullPath = path.join(uploadsDir, fileName);

      await writeFile(fullPath, buffer);

      imagePath = `/uploads/${fileName}`;
    }

    const produk = await prisma.produk.create({
      data: {
        name,
        description,
        image: imagePath,
        price: priceNumber,
        capacity: capacityNumber,
      },
    });

    return NextResponse.json(produk, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/Produks error:", error);
    return NextResponse.json(
      { message: error?.message || "Gagal menambahkan Produk" },
      { status: 500 }
    );
  }
}
