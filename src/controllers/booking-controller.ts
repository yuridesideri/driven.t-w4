import { requestError } from "@/errors";
import { AuthenticatedRequest } from "@/middlewares"
import { getBookingService } from "@/services/bookings-service";
import { Response } from "express"
import httpStatus from "http-status"


export async function getBooking(req: AuthenticatedRequest, res: Response): Promise<Response>{
    try {
        const { userId } = req;
        const booking = await getBookingService(userId);
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

