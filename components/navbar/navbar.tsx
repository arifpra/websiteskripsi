"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

type CartResponse = {
  id: string;
  items: Array<{ id: string; quantity: number }>;
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/produk", label: "Product" },
  { href: "/custom-order", label: "Custom Order" },
  { href: "/history-order", label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const role = (session?.user as any)?.role as
    | "ADMIN"
    | "OWNER"
    | "CUSTOMER"
    | undefined;

  const isAdminLike = role === "ADMIN" || role === "OWNER";

  const [cartCount, setCartCount] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = useMemo(() => {
    const name =
      session?.user?.name ??
      (session?.user as any)?.username ??
      (session?.user as any)?.email ??
      "User";
    const s = String(name).trim();
    return s ? s.charAt(0).toUpperCase() : "U";
  }, [session]);

  useEffect(() => {
    const loadCartCount = async () => {
      if (status !== "authenticated" || isAdminLike) return;

      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) {
          setCartCount(0);
          return;
        }
        const data = (await res.json()) as CartResponse;
        const totalQty = Array.isArray(data?.items)
          ? data.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
          : 0;
        setCartCount(totalQty);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
  }, [status, isAdminLike]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#0b2a22]">
      {/* Bar */}
      <div className="km-nav bg-[#0b2a22] border-b border-km-line shadow-md">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="h-auto min-h-[80px] py-2 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Logo */}
            <Link
              href={isAdminLike ? "/admin" : "/"}
              className="flex items-center gap-3 no-underline"
              aria-label="Kayoe Moeda"
            >
              <Image
                src="/logo-kayoe.png"
                alt="Kayoe Moeda"
                width={280}
                height={80}
                className="h-16 w-auto scale-[1.25] origin-left"
                priority
              />
            </Link>

            {/* Center: Nav (desktop customer only) */}
            {!isAdminLike && (
              <nav className="hidden md:flex items-center gap-6">
                {NAV.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={[
                      "no-underline text-sm font-semibold tracking-widest transition uppercase",
                      isActive(it.href)
                        ? "border-b-2 border-km-brass text-white pb-1"
                        : "text-white/85 hover:text-white",
                    ].join(" ")}
                  >
                    {it.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mobile menu button (customer only) */}
              {!isAdminLike && (
                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center rounded-full w-10 h-10
                             bg-km-moss ring-1 ring-km-line text-white hover:opacity-90 transition"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 7h16M4 12h16M4 17h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}

              {/* ✅ Cart icon – PREMIUM */}
              {!isAdminLike && session && (
                <Link
                  href="/cart"
                  className="
                    relative
                    group
                    inline-flex items-center justify-center
                    w-11 h-11
                    rounded-full
                    bg-km-brass
                    text-white
                    ring-1 ring-km-line
                    shadow-sm
                    hover:shadow-md
                    hover:ring-km-ink/30
                    hover:opacity-90
                    transition-all
                    duration-200
                  "
                  aria-label="Keranjang"
                  title="Keranjang"
                >
                  {/* Cart icon */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="
                      text-white
                      transition-transform
                      duration-200
                      group-hover:scale-110
                    "
                  >
                    <path
                      d="M6 6h15l-2 8H7L6 6Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6 5 3H2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                    <circle cx="18" cy="20" r="1.5" fill="currentColor" />
                  </svg>

                  {/* Badge */}
                  {cartCount > 0 && (
                    <span
                      className="
                        absolute -top-1 -right-1
                        min-w-[18px] h-[18px]
                        px-[5px]
                        flex items-center justify-center
                        rounded-full
                        bg-gradient-to-br from-red-500 to-red-600
                        text-white
                        text-[10px]
                        font-bold
                        leading-none
                        shadow-md
                        ring-2 ring-white
                      "
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Profile chip (when logged in) */}
              {session && (
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-km-moss ring-1 ring-km-line px-2 py-1 max-w-[220px] text-white">
                  <div className="w-9 h-9 rounded-full bg-km-brass flex items-center justify-center font-bold text-km-wood">
                    {initials}
                  </div>
                  <div className="pr-2">
                    <div className="text-xs font-semibold leading-tight text-white max-w-[120px] truncate">
                      {session.user?.name ??
                        (session.user as any)?.username ??
                        "User"}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/80">
                      {role ?? "USER"}
                    </div>
                  </div>
                </div>
              )}

              {/* Sign in/out */}
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold
                             bg-km-brass text-white ring-1 ring-km-line hover:opacity-90 transition"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/signin"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold
                             bg-km-brass text-white ring-1 ring-km-brass hover:opacity-90 transition shadow-sm no-underline"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer (customer only) */}
      {!isAdminLike && mobileOpen && (
        <div className="md:hidden bg-[#0b2a22] border-b border-km-line">
          <div className="mx-auto max-w-6xl px-4 py-3 space-y-2">
            {NAV.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "block px-4 py-3 rounded-2xl text-sm font-semibold transition no-underline",
                  isActive(it.href)
                    ? "bg-km-moss ring-1 ring-km-line text-white"
                    : "text-white/85 hover:text-white hover:bg-km-moss",
                ].join(" ")}
              >
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
