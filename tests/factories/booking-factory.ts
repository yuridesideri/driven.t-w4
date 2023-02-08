import { prisma } from "@/config";

export async function createBooking(userId: number, roomId: number){
  const booking = await prisma.booking.create({
    data: {
        User: {
            connect: {
                id: userId
            }
        },
        Room: {
            connect: {
                id: roomId
            }
        },
    }
  });

  return booking;
}