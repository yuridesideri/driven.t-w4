import joi from 'joi';

export const bookingIdSchema = joi.object({
  bookingId: joi.number().required(),
});

export const roomIdSchema = joi.object({
  roomId: joi.number().required(),
});
