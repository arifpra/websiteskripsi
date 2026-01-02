import { Prisma } from "@prisma/client";

export type produkProps = Prisma.ProdukGetPayload<{
  include: { amenities: { select: { amenitiesId: true } } };
}>;

export type produkProps2 = Prisma.ProdukGetPayload<{
  include: {
    amenities: {
      include: {
        amenities: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;

export type DisabledDateProps = Prisma.ReservationGetPayload<{
  select: {
    starDate: true;
    endDate: true;
  };
}>;
