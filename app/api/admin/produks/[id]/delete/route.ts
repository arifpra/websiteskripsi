import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.produk.delete({
      where: { id },
    });

    // Redirect ke daftar produk setelah berhasil hapus
    return NextResponse.redirect(new URL("/admin/products", req.url));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
