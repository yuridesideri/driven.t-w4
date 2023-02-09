import { changeBooking, getBooking, insertBooking } from "@/controllers";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { bookingIdSchema, roomIdSchema } from "@/schemas";
import { Router } from "express";

export const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", validateBody(roomIdSchema), insertBooking)
  .put("/:bookingId", validateParams(bookingIdSchema), validateBody(roomIdSchema), changeBooking);
