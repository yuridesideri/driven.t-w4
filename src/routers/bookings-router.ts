import { getBooking, insertBooking } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingIdSchema } from '@/schemas';
import { Router } from 'express';

export const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingIdSchema), insertBooking)
  .put('/:bookingId');
