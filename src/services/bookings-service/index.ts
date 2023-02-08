import { getBookingRepo } from "@/repositories/booking-repository";

export async function getBookingService(userId: number) {
    const booking = await getBookingRepo(userId);
    return booking;
}