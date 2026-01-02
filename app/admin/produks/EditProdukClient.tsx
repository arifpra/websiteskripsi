// app/admin/produks/[id]/EditProdukClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

type Props = {
  produk: ProdukItem;
};

export default function EditProdukClient({ produk }: Props) {
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(
    resolveImageSrc(produk.image)
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/admin/produks/${produk.id}`, {
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
      router.refresh(); // refresh halaman detail
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

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/produks/${produk.id}/delete`, {
        method: "POST",
      });

      if (!res.ok) {
        const text = await res.text();
        let data: unknown = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          console.error(
            "Response POST /api/admin/produks/[id]/delete bukan JSON:",
            text
          );
        }

        const message =
          data &&
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as any).message === "string"
            ? (data as any).message
            : "Gagal menghapus produk";
        throw new Error(message);
      }

      router.push("/admin/products"); // balik ke daftar produk
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat menghapus produk");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit / Hapus Produk</h2>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "Menghapus..." : "Hapus Produk"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
