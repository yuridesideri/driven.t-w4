import { Request, Response } from "express"
import httpStatus from "http-status"


export async function getBookings(req: Request, res: Response): Promise<Response>{
    try {
        
    }catch (err){
        console.error(err)
        res.status(err.status || httpStatus.BAD_REQUEST)
        return res.send(err)
    }
}