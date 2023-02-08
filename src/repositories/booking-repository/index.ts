import { prisma } from "@/config";

export function getBookingRepo (userId: number){
    return prisma.booking.findFirst({
        where: {
            userId
        }
    })
}