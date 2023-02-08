import { requestError } from "@/errors";
import { changeBookingRepo, getBookingRepo, getRoomCapacityAndBookingsRepo, insertBookingRepo } from "@/repositories/booking-repository";
import httpStatus from "http-status";

async function getBookingService(userId: number) {
    const booking = await getBookingRepo(userId);
    if (!booking){
        throw requestError(httpStatus.NOT_FOUND, "Booking not found");
    }
    return booking;
}

async function checkRoomDisponibilityService(RoomId: number){
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

async function changeBookingService(userId: number, bookingId: number, roomId: number){
    const booking = await getBookingService(userId);
    if (booking.id !== bookingId){
        throw requestError(httpStatus.FORBIDDEN, "You can't change other user's booking");
    }
    await checkRoomDisponibilityService(roomId);
    const bookingUpdated = await changeBookingRepo(bookingId, roomId);
    return bookingUpdated.id;
}

const bookingService = {
    getBookingService,
    checkRoomDisponibilityService,
    insertBookingService,
    changeBookingService
}
export default bookingService