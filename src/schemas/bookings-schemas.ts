import joi from "joi";

export const bookingIdSchema = joi.object({
    bookingId: joi.number().required()
})