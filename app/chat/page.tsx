"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya chatbot Kayoe Moeda. Silakan tanya seputar produk, custom order, atau proses pemesanan.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Gagal memproses chat.");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Maaf, ada kendala saat memproses pesan. Silakan coba lagi.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Baik, saya bantu." },
      ]);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungi chatbot.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Maaf, ada kendala jaringan. Silakan coba lagi beberapa saat.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-6 py-10">
        <div className="rounded-2xl km-tile">
          <div className="border-b px-5 py-4">
            <p className="text-xs uppercase tracking-[0.32em] text-km-ink/45">
              Chatbot
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-km-ink">
              Kayoe Moeda Assistant
            </h1>
            <p className="mt-1 text-sm text-km-ink/60">
              Jawaban otomatis untuk pertanyaan dasar dan bantuan pemesanan.
            </p>
          </div>

          <div className="px-5 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-km-sand ring-1 ring-km-line"
                      : "bg-km-paper ring-1 ring-km-line"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t px-5 py-4">
            {error && (
              <div className="mb-3 rounded-2xl bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm">
                {error}
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                className="flex-1 rounded-2xl border border-km-line bg-km-paper px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-km-caramel/70"
                placeholder="Tulis pertanyaan Anda..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="rounded-2xl bg-km-wood text-km-cream ring-1 ring-km-wood px-4 py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Mengirim..." : "Kirim"}
              </button>
            </div>
            <p className="mt-2 text-xs text-km-ink/55">
              Balasan bersifat otomatis. Untuk pesanan cepat, gunakan tombol
              WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
