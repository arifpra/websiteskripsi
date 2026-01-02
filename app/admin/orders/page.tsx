// app/admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type OrderItemRow = {
  id: string;
  orderCode: string;
  grossAmount: number;
  paymentStatus: string;
  shippingStatus: string;
  createdAt: string;
  user: UserInfo;
  items: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItemRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/orders", {
          method: "GET",
          cache: "no-store",
        });

        let data: unknown = null;

        try {
          data = await res.json();
        } catch {
          console.error("Response GET /api/admin/orders bukan JSON valid");
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
              : "Gagal mengambil data pesanan";

          setError(message);
          return;
        }

        if (!Array.isArray(data)) {
          setError("Format data pesanan tidak sesuai");
          return;
        }

        setOrders(data as OrderItemRow[]);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data pesanan"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatTanggal = (value: string) =>
    new Date(value).toLocaleString("id-ID");

  const getStatusLabel = (order: OrderItemRow) => {
    if (order.paymentStatus === "CANCELLED") return "Dibatalkan";
    if (order.shippingStatus === "DELIVERED") return "Selesai";
    if (order.shippingStatus === "PACKED" || order.shippingStatus === "SHIPPED") {
      return "Diproses";
    }
    return "Pending";
  };

  const getOrderSummary = (items: OrderItem[]) => {
    if (!items || items.length === 0) return "-";
    const first = items[0];
    if (items.length === 1) return first.name;
    return `${first.name} (+${items.length - 1} item)`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Admin - Pesanan Kayoe Moeda
      </h1>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 border border-red-300 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {loading && !error && (
        <p className="text-sm text-gray-600">Memuat daftar pesanan...</p>
      )}

      {!loading && !error && (
        <>
          <p className="text-sm text-gray-600 mb-3">
            Total pesanan: <span className="font-semibold">{orders.length}</span>
          </p>

          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada pesanan dari pelanggan Kayoe Moeda.
            </p>
          ) : (
            <div className="overflow-x-auto border rounded-lg bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Tanggal</th>
                    <th className="px-3 py-2 text-left">Customer</th>
                    <th className="px-3 py-2 text-left">Produk</th>
                    <th className="px-3 py-2 text-left">Total</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const status = getStatusLabel(order);

                    return (
                      <tr
                        key={order.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatTanggal(order.createdAt)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">
                            {order.user?.name ?? "Tanpa nama"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.user?.email}
                          </div>
                          {order.user?.phone && (
                            <div className="text-xs text-gray-500">
                              {order.user.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium">
                            {getOrderSummary(order.items)}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          Rp{" "}
                          {Number(order.grossAmount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Lihat detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
