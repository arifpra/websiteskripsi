import Image from "next/image";

type ProdukCardProps = {
  produk: {
    image: string;
    name: string;
    capacity: number;
    price: number;
  };
};

export default function produkCard({ produk }: ProdukCardProps) {
  return (
    <div className="km-tile rounded-lg overflow-hidden">
      <div className="relative w-full h-56">
        <Image
          src={produk.image}
          alt={produk.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-km-ink">{produk.name}</h3>
        <p className="text-km-ink/60 text-sm mt-1">Kapasitas: {produk.capacity}</p>
        <p className="text-km-ink font-semibold mt-1">
          Rp {produk.price.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
