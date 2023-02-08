import { requestError } from "@/errors";
import { AuthenticatedRequest } from "@/middlewares"
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";
import hotelService from "@/services/hotels-service";


export async function getBooking(req: AuthenticatedRequest, res: Response): Promise<Response>{
    try {
        const { userId } = req;
        const booking = await bookingService.getBookingService(userId);
        if (!booking){
            throw requestError(httpStatus.NOT_FOUND, "Booking not found");
        }
        res.status(200).send(booking);
    }catch (err){
        console.error(err)
        res.status(err.status || httpStatus.BAD_REQUEST)
        return res.send(err)
    }
}


export async function insertBooking(req: AuthenticatedRequest, res: Response): Promise<Response>{
    try {
        const { userId } = req;
        const { RoomId } = req.body;
        await hotelService.getHotels(userId);
        await bookingService.checkRoomDisponibility(parseInt(RoomId));
        const bookingId = await bookingService.insertBookingService(userId, parseInt(RoomId));
        res.status(200).send(bookingId);
    }catch (err){
        console.error(err)
        res.status(err.status || httpStatus.FORBIDDEN)
        return res.send(err)
    }
}