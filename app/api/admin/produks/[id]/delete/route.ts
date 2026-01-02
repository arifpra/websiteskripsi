import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
      return NextResponse.json(
        { message: "Tidak memiliki akses" },
        { status: 403 }
      );
    }

    const { id } = await params;

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
