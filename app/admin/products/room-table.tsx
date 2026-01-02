"use client";

import { useState } from "react";
import type { Produk } from "@prisma/client";

type ProdukRow = Omit<Produk, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Props = {
  initialproduks: ProdukRow[];
};

export default function produkTable({ initialproduks }: Props) {
  const [produks, setproduks] = useState<ProdukRow[]>(initialproduks);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    capacity: "1",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("capacity", form.capacity);
      if (imageFile) {
        fd.append("image", imageFile);
      }

      const res = await fetch("/api/admin/produks", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal menambahkan produk");
      }

      const newproduk: ProdukRow = await res.json();
      setproduks((prev) => [newproduk, ...prev]);

      // reset form
      setForm({
        name: "",
        description: "",
        price: "",
        capacity: "1",
      });
      setImageFile(null);
      // reset nilai file input
      const fileInput = document.getElementById(
        "produk-image-input"
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Tambah produk */}
      <div className="bg-white border rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold mb-3">
          Tambah Produk Kayoe Moeda
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Nama produk</label>
            <input
              type="text"
              className="border rounded-md px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Harga (Rp)</label>
            <input
              type="text"
              className="border rounded-md px-3 py-2 text-sm"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="contoh: 15000 atau 15.000"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Stok</label>
            <input
              type="number"
              className="border rounded-md px-3 py-2 text-sm"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              min={1}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Gambar Produk</label>
            <input
              id="produk-image-input"
              type="file"
              accept="image/*"
              className="border rounded-md px-3 py-2 text-sm bg-white"
              onChange={(e) =>
                setImageFile(e.target.files?.[0] ? e.target.files[0] : null)
              }
            />
            <span className="text-[11px] text-gray-500">
              Format: JPG, PNG, dll. Disimpan di storage publik.
            </span>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs text-gray-600">Deskripsi</label>
            <textarea
              className="border rounded-md px-3 py-2 text-sm min-h-[80px]"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          {error && (
            <div className="md:col-span-2 text-xs text-red-500">{error}</div>
          )}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan produk"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel produk */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Daftar produk</h2>
          <span className="text-xs text-gray-500">
            Total: {produks.length} produk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Harga</th>
                <th className="px-4 py-2 text-left">Stok</th>
                <th className="px-4 py-2 text-left">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {produks.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Belum ada produk Kayoe Moeda.
                  </td>
                </tr>
              )}

              {produks.map((produk) => (
                <tr key={produk.id} className="border-b last:border-0">
                  <td className="px-4 py-2">{produk.name}</td>
                  <td className="px-4 py-2">
                    Rp {produk.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2">{produk.capacity}</td>
                  <td className="px-4 py-2">
                    {new Date(produk.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
