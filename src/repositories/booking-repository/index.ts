import { prisma } from "@/config";
import { requestError } from "@/errors";
import httpStatus from "http-status";

export function getBookingRepo (userId: number){
    return prisma.booking.findFirst({
        where: {
            userId
        }
    })
}

export function getRoomCapacityAndBookingsRepo (RoomId: number){
    return prisma.room.findFirst({
        where: {
            id: RoomId
        },
        select: {
            capacity: true,
            _count: {
                select:{
                    Booking: true
                }
            }
        },
        rejectOnNotFound(error) {
            return requestError(httpStatus.NOT_FOUND, "Room not found");
        },
    })
}

export function insertBookingRepo (userId: number, roomId: number){
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

export function changeBookingRepo (bookingId: number, roomId: number){
    return prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            roomId
        }
    })
}