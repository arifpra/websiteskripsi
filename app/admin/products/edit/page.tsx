"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resolveImageSrc } from "@/lib/utils";

type ProdukItem = {
  id: string;
  name: string;
  price: number;
  capacity: number;
  image: string;
  description: string;
  createdAt: string;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [produk, setProduk] = useState<ProdukItem | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Ambil data produk dari API list, lalu cari by id
  useEffect(() => {
    if (!id) return;

    const fetchProduk = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/produks");

        if (!res.ok) {
          throw new Error("Gagal mengambil data produk");
        }

        const text = await res.text();
        let data: unknown = [];

        try {
          data = text ? JSON.parse(text) : [];
        } catch {
          console.error("Response /api/admin/produks bukan JSON valid:", text);
          throw new Error("Response server tidak valid");
        }

        if (!Array.isArray(data)) {
          throw new Error("Format data produk tidak sesuai");
        }

        const list = data as ProdukItem[];
        const found = list.find((item) => item.id === id);

        if (!found) {
          throw new Error("Produk tidak ditemukan");
        }

        setProduk(found);
        setPreview(resolveImageSrc(found.image));
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan saat mengambil produk");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduk();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/admin/produks/${id}`, {
        method: "PATCH",
        body: formData,
      });

      const text = await res.text();
      let data: unknown = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error(
          "Response PATCH /api/admin/produks/[id] bukan JSON:",
          text
        );
      }

      if (!res.ok) {
        const message =
          data &&
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as any).message === "string"
            ? (data as any).message
            : "Gagal menyimpan perubahan";
        throw new Error(message);
      }

      setSuccess("Perubahan berhasil disimpan.");
      // Redirect kembali ke detail
      router.push(`/admin/produks/${id}`);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat menyimpan perubahan");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  if (!id) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          ID produk tidak ditemukan di URL.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-600">Memuat data produk...</p>
      </div>
    );
  }

  if (error || !produk) {
    return (
      <div className="p-6 space-y-2">
        <p className="text-sm text-red-600">{error ?? "Produk tidak ditemukan"}</p>
        <Link
          href="/admin/products"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        Edit Produk Kayoe Moeda
      </h1>

      <Link
        href={`/admin/produks/${id}`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Kembali ke detail produk
      </Link>

      {error && (
        <div className="mt-4 mb-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 mb-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Produk</label>
          <input
            type="text"
            name="name"
            defaultValue={produk.name}
            className="w-full border px-3 py-2 rounded text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Harga</label>
            <input
              type="number"
              name="price"
              defaultValue={produk.price}
              className="w-full border px-3 py-2 rounded text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stok</label>
            <input
              type="number"
              name="capacity"
              defaultValue={produk.capacity}
              className="w-full border px-3 py-2 rounded text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Gambar (opsional)
          </label>

          {preview && (
            <div className="relative h-40 w-40 mb-2">
              <Image
                src={preview}
                alt={produk.name}
                fill
                className="object-cover rounded border"
              />
            </div>
          )}

          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handlePreviewChange}
            className="text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={produk.description}
            className="w-full border px-3 py-2 rounded text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
