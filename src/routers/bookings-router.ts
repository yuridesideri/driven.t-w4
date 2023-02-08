import { authenticateToken } from '@/middlewares';
import { Router } from 'express';

export const bookingsRouter = Router();

bookingsRouter.all('/*', authenticateToken).get('/').post('/').put('/:bookingId');
