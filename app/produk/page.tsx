// app/produk/page.tsx
"use client";

import { useEffect, useState } from "react";
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

export default function ProdukPage() {
  const [produks, setProduks] = useState<ProdukItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Ambil daftar produk dari API
  useEffect(() => {
    const fetchProduks = async () => {
      try {
        setError(null);
        setInfo(null);
        setLoading(true);

        const res = await fetch("/api/admin/produks", {
          method: "GET",
          cache: "no-store",
        });

        let data: unknown = null;

        try {
          data = await res.json();
        } catch {
          console.error("Response GET /api/admin/produks bukan JSON valid");
          setError("Response server tidak valid.");
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

  // Tambah ke cart
  const handleAddToCart = async (produkId: string) => {
    try {
      setError(null);
      setInfo(null);
      setAddingId(produkId);

      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produkId,
          quantity: 1,
        }),
      });

      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        console.error("Response /api/cart/add bukan JSON valid");
      }

      if (!res.ok) {
        const message =
          data &&
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as any).message === "string"
            ? (data as any).message
            : "Gagal menambahkan ke keranjang";

        setError(message);
        return;
      }

      setInfo("Produk berhasil ditambahkan ke keranjang.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambahkan ke keranjang"
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-km-sand">
      {/* OPSI B: container per page */}
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.32em] text-black/45">
            Katalog
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111827]">
            Produk Kayoe Moeda
          </h1>
          <p className="text-[#111827]/70 max-w-2xl">
            Temukan kursi, meja, dan perabotan kayu lainnya. Gunakan layanan
            custom untuk ukuran dan model yang lebih sesuai kebutuhan ruang.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-red-500/20 text-red-700 shadow-md">
            <p className="text-sm font-semibold">Terjadi kesalahan</p>
            <p className="text-sm mt-1 text-red-700/90">{error}</p>
          </div>
        )}

        {info && (
          <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-emerald-500/20 text-emerald-700 shadow-md">
            <p className="text-sm font-semibold">Berhasil</p>
            <p className="text-sm mt-1 text-emerald-700/90">{info}</p>
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 shadow-md">
              <p className="text-sm text-black/60">Memuat produk...</p>
            </div>
          ) : produks.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-black/5 shadow-md">
              <p className="text-sm uppercase tracking-[0.32em] text-black/40">
                Empty state
              </p>
              <h3 className="mt-3 text-lg md:text-xl font-semibold tracking-tight text-[#111827]">
                Belum ada produk tersedia
              </h3>
              <p className="mt-2 text-[#111827]/70">
                Silakan cek kembali nanti atau ajukan pesanan custom.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {produks.map((produk) => {
                const imageSrc = resolveImageSrc(produk.image);

                return (
                  <article
                    key={produk.id}
                    className="group overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-md
                               transition hover:-translate-y-1 hover:shadow-lg flex flex-col"
                  >
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image
                        src={imageSrc}
                        alt={produk.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-70" />
                    </div>

                    <div className="p-5 md:p-6 flex-1 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base md:text-lg font-semibold tracking-tight text-[#111827] line-clamp-1">
                          {produk.name}
                        </h3>

                        <span className="shrink-0 rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/60">
                          Stok {produk.capacity}
                        </span>
                      </div>

                      <p className="text-sm text-[#111827]/70 line-clamp-3 leading-relaxed">
                        {produk.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
              <p className="text-base md:text-lg font-semibold text-km-ink">
                Rp {produk.price.toLocaleString("id-ID")}
              </p>
                        <p className="text-xs text-black/45">Ready stock</p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(produk.id)}
                        disabled={addingId === produk.id}
                        className="mt-3 inline-flex items-center justify-center rounded-2xl px-4 py-2.5
                                   text-sm font-semibold bg-km-clay ring-1 ring-km-line transition hover:bg-km-cream
                                   disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {addingId === produk.id
                          ? "Menambahkan..."
                          : "Tambah ke keranjang"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
