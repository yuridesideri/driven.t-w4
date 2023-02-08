import { requestError } from "@/errors";
import { getBookingRepo, getRoomCapacityAndBookingsRepo, insertBookingRepo } from "@/repositories/booking-repository";
import httpStatus from "http-status";

async function getBookingService(userId: number) {
    const booking = await getBookingRepo(userId);
    return booking;
}

async function checkRoomDisponibility(RoomId: number){
    const roomCapacityAndBookings = await getRoomCapacityAndBookingsRepo(RoomId);
    if (roomCapacityAndBookings._count.Booking === roomCapacityAndBookings.capacity){
        throw requestError(httpStatus.FORBIDDEN, "Room is full");
    }
}

async function insertBookingService(userId: number, roomId: number){
    const booking = await getBookingService(userId);
    if (booking){
        throw requestError(httpStatus.FORBIDDEN, "User already has a booking");
    }
    const bookingCreated = await insertBookingRepo(userId, roomId);

    return bookingCreated.id;
}

const bookingService = {
    getBookingService,
    checkRoomDisponibility,
    insertBookingService
}
export default bookingService