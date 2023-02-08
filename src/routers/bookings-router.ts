import { getBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';

export const bookingsRouter = Router();

bookingsRouter.all('/*', authenticateToken).get('/', getBooking).post('/').put('/:bookingId');
