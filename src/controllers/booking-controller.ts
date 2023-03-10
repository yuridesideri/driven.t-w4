import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";
import hotelService from "@/services/hotels-service";

export async function getBooking(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const { userId } = req;
    const booking = await bookingService.getBookingService(userId);
    return res.status(200).send(booking);
  }catch (err) {
    res.status(err.status || httpStatus.BAD_REQUEST);
    return res.send(err);
  }
}

export async function insertBooking(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const { userId } = req;
    const { roomId } = req.body;
    await hotelService.getHotels(userId);
    await bookingService.checkRoomDisponibilityService(parseInt(roomId));
    const bookingId = await bookingService.insertBookingService(userId, parseInt(roomId));
    return res.status(200).send(bookingId);
  }catch (err) {
    res.status(err.status || httpStatus.FORBIDDEN);
    return res.send(err);
  }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response): Promise<Response> {
  try {
    const { userId } = req;
    const { roomId } = req.body;
    const { bookingId } = req.params;
    await hotelService.getHotels(userId);
    const updatedBookingId = await bookingService.changeBookingService(userId, parseInt(bookingId), parseInt(roomId));
    return res.status(200).send(updatedBookingId);
  }catch (err) {
    res.status(err.status || httpStatus.FORBIDDEN);
    return res.send(err);
  }
}
