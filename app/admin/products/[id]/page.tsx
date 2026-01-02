// app/admin/products/[id]/page.tsx
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [produk, setProduk] = useState<ProdukItem | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Ambil semua produk, lalu cari yang id-nya sama
  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);

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

        if (!Array.isArray(data)) {
          setError("Format data produk tidak sesuai");
          return;
        }

        const list = data as ProdukItem[];
        const found = list.find((p) => p.id === id);

        if (!found) {
          setError("Produk tidak ditemukan");
          return;
        }

        setProduk(found);

        const img = found.image;
        setPreview(resolveImageSrc(img));
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data produk"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    if (!produk) return;

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

      let data: unknown = null;

      try {
        data = await res.json();
      } catch {
        console.error("Response PATCH /api/admin/produks/[id] bukan JSON");
      }

      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          data !== null &&
          "message" in data
            ? (data as any).message
            : "Gagal menyimpan perubahan";

        setError(msg);
        return;
      }

      // refresh detail
      if (data && typeof data === "object") {
        const updated = data as ProdukItem;
        setProduk(updated);
        const img = updated.image;
        setPreview(resolveImageSrc(img));
      }

      setSuccess("Perubahan berhasil disimpan.");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm(
      "Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (!ok) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/produks/${id}`, {
        method: "DELETE",
      });

      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        console.error("Response DELETE /api/admin/produks/[id] bukan JSON");
      }

      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          data !== null &&
          "message" in data
            ? (data as any).message
            : "Gagal menghapus produk";

        setError(msg);
        return;
      }

      // kembali ke list setelah delete
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghapus produk");
    } finally {
      setDeleting(false);
    }
  };

  if (!id) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          ID produk tidak ditemukan di URL.
        </p>
        <Link
          href="/admin/products"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-600">Memuat detail produk...</p>
      </div>
    );
  }

  if (error || !produk) {
    return (
      <div className="p-6 space-y-2">
        <p className="text-sm text-red-600">
          {error ?? "Produk tidak ditemukan"}
        </p>
        <Link
          href="/admin/products"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  const imageSrc = resolveImageSrc(preview ?? produk.image);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold mb-2">
        Detail Produk Kayoe Moeda
      </h1>

      <Link
        href="/admin/products"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Kembali ke daftar produk
      </Link>

      {(error || success) && (
        <div className="mt-3 space-y-2">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded text-sm">
              {success}
            </div>
          )}
        </div>
      )}

      {/* KARTU DETAIL */}
      <div className="border rounded-lg bg-white overflow-hidden flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/2 h-64 md:h-auto">
          <Image
            src={imageSrc}
            alt={produk.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4 md:w-1/2 space-y-3">
          <h2 className="text-lg font-semibold">{produk.name}</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-medium">Harga:</span>{" "}
              Rp {produk.price.toLocaleString("id-ID")}
            </div>
            <div>
              <span className="font-medium">Stok:</span> {produk.capacity}
            </div>
            <div>
              <span className="font-medium">ID Produk:</span> {produk.id}
            </div>
            <div>
              <span className="font-medium">Dibuat:</span>{" "}
              {new Date(produk.createdAt).toLocaleString("id-ID")}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-1">Deskripsi</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {produk.description}
            </p>
          </div>

          {/* Tombol aksi */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setEditMode((v) => !v);
                setSuccess(null);
                setError(null);
              }}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {editMode ? "Batal Edit" : "Edit Produk"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Menghapus..." : "Hapus Produk"}
            </button>
          </div>
        </div>
      </div>

      {/* FORM EDIT */}
      {editMode && (
        <div className="border rounded-lg bg-white p-4 space-y-4">
          <h2 className="text-md font-semibold">Edit Produk</h2>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Produk
              </label>
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
                <label className="block text-sm font-medium mb-1">
                  Stok
                </label>
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
                <div className="relative h-32 w-32 mb-2">
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
              <label className="block text-sm font-medium mb-1">
                Deskripsi
              </label>
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
      )}
    </div>
  );
}
