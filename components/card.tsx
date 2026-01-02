import Image from "next/image";
import Link from "next/link";
import { IoPeopleOutline } from "react-icons/io5";
import type { Produk } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

const Card = ({ produk }: { produk: Produk }) => {
  return (
    <div className="km-tile rounded-sm transition duration-150 hover:shadow-lg">
      {/* image waraper */}
      <div className="h-[260px] w-auto rounded-t-sm relative">
        <Image
          src={produk.image}
          width={384}
          height={256}
          alt="blog 1"
          className="w-full h-full object-cover rounded-t-sm"
        />
      </div>
      {/* Icons Wraper */}
      <div className="p-8">
        <h4 className="text-2xl font-medium text-km-ink">
          <Link
            href={`/produk/${produk.id}`}
            className="hover:text-km-ink transition duration-150"
          >
            {produk.name}
          </Link>
        </h4>
        <h4 className="text-xl mb-7">
          <span className="font-semibold text-km-ink">
            {formatCurrency(produk.price)}
          </span>
          <span className="text-km-ink/55 text-sm">/Night</span>
        </h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-km-ink/70">
            <IoPeopleOutline />
            <span>
              {produk.capacity} {produk.capacity === 1 ? "person" : "people"}
            </span>
          </div>
          <Link
            href={`/produk/${produk.id}`}
            className="px-6 py-2.5 md:px-10 md:py-3 font-semibold text-km-wood bg-km-brass rounded-sm hover:opacity-90 transition duration-150"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
