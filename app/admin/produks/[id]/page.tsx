// app/admin/produks/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveImageSrc } from "@/lib/utils";

type PageProps = {
  // Di Next.js 16 params adalah Promise
  params: Promise<{ id: string }>;
};

export default async function AdminProdukDetailPage(props: PageProps) {
  const { id } = await props.params;

  if (!id || id === "undefined") {
    return notFound();
  }

  const produk = await prisma.produk.findUnique({
    where: { id },
  });

  if (!produk) {
    return notFound();
  }

  const imageSrc = resolveImageSrc(produk.image);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* BARIS ATAS: Kembali + Edit + Hapus */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin/products"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke daftar produk
        </Link>

        {/* 🔥 Edit ke /admin/products/[id] */}
        <Link
          href={`/admin/products/${id}`}
          className="text-sm px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Edit Produk
        </Link>

        <form
          action={`/api/admin/produks/${id}/delete`}
          method="POST"
          className="inline"
        >
          <button
            type="submit"
            className="text-sm px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Hapus Produk
          </button>
        </form>
      </div>

      {/* KARTU DETAIL PRODUK */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="relative h-72 w-full">
          <Image
            src={imageSrc}
            alt={produk.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4 space-y-2">
          <h1 className="text-xl font-semibold">{produk.name}</h1>

          <div className="text-sm text-gray-700">
            Harga:{" "}
            <span className="font-semibold">
              Rp {produk.price.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="text-sm text-gray-700">
            Stok: <span className="font-semibold">{produk.capacity} pcs</span>
          </div>

          <p className="text-sm text-gray-600 whitespace-pre-line mt-2">
            {produk.description}
          </p>

          <p className="text-xs text-gray-400 mt-3">
            Dibuat:{" "}
            {new Date(produk.createdAt).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
