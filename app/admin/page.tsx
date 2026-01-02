// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { resolveImageSrc } from "@/lib/utils";

type ProdukItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  capacity: number;
};

export default function AdminOverviewPage() {
  const [produks, setProduks] = useState<ProdukItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil list produk untuk overview
  useEffect(() => {
    const fetchProduks = async () => {
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/admin/produks", {
          method: "GET",
          cache: "no-store",
        });

        let data: unknown = null;

        try {
          data = await res.json();
        } catch {
          console.error("Response GET /api/admin/produks bukan JSON valid");
          setError("Response server tidak valid");
          return;
        }

        if (!res.ok) {
          const message =
            data &&
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as any).message === "string"
              ? (data as any).message
              : "Gagal mengambil data produk";

          setError(message);
          return;
        }

        if (!Array.isArray(data)) {
          setError("Format data produk tidak sesuai");
          return;
        }

        setProduks(data as ProdukItem[]);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil produk"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduks();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin - Overview Kayoe Moeda</h1>

      <p className="text-sm text-gray-600 mb-4">
        Ringkasan produk Kayoe Moeda yang sudah diunggah. Untuk menambah atau
        mengubah produk, gunakan menu{" "}
        <Link
          href="/admin/products"
          className="text-blue-600 hover:underline font-medium"
        >
          Produk
        </Link>
        .
      </p>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 border border-red-300 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <p className="text-sm text-gray-600">Memuat daftar produk...</p>
      )}

      {/* LIST PRODUK */}
      {!loading && !error && (
        <>
          <h2 className="text-lg font-semibold mb-2">
            Daftar Produk ({produks.length})
          </h2>

          {produks.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada produk Kayoe Moeda.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {produks.map((produk) => {
                const imageSrc = resolveImageSrc(produk.image);

                return (
                  <Link
                    key={produk.id}
                    href={`/admin/products/${produk.id}`}
                    className="border rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="relative h-40 w-full">
                      <Image
                        src={imageSrc}
                        alt={produk.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="text-sm font-semibold">
                        {produk.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        Rp {produk.price.toLocaleString("id-ID")} • Stok{" "}
                        {produk.capacity}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {produk.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
