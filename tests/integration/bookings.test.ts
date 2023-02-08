import app, { init } from '@/app';
import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { createEnrollmentWithAddress, createHotel, createRoomWithHotelId, createTicket, createTicketType, createTicketTypeWithHotel, createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import * as jwt from 'jsonwebtoken';
import { createBooking } from '../factories/booking-factory';
import { TicketStatus } from '@prisma/client';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /bookings', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/bookings');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/bookings').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/bookings').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {

    it('should respond with NOT_FOUND(404) when user has no bookings', async () => {
      const token = await generateValidToken()
      
      const response = await server.get('/bookings').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with OK(200) when user has bookings', async () => {
      const user = await createUser();
      const token = await generateValidToken(user)
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const createdBooking = await createBooking(user.id, room.id);

      const response = await server.get('/bookings').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: createdBooking.id,
        Room: { ...room,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /bookings', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/bookings');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with NOT_FOUND(404) when roomId does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user)
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with FORBIDDEN(403) when room is at full capacity', async () => {
      const user = await createUser();
      const user1 = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await createBooking(user1.id, room.id);
      await createBooking(user2.id, room.id);
      await createBooking(user3.id, room.id);

      const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    describe('when user has no proper business rules respond with FORBIDDEN(403)', () => {
      it('when user doesnt have an enrollment yet', async () => {
        const token = await generateValidToken();
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({
          roomId: room.id,
        });

        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });

      it('when user doesnt have a ticket yet', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({
          roomId: room.id,
        });

        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });
    });

    it('should respond with OK(200) when roomId and ticket are valid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user)
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      console.log(response.body)

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
      });
    });
  });
});

describe('PUT /bookings/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put(`/bookings/1`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put(`/bookings/1`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put(`/bookings/1`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    it('should respond with NOT_FOUND(404) when roomId does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user)
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    describe('when user has no proper business rules respond with FORBIDDEN(403)', () => {
      it('when user doesnt have an enrollment yet', async () => {
        const token = await generateValidToken();
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({
          roomId: room.id,
        });

        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });

      it('when user doesnt have a ticket yet', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({
          roomId: room.id,
        });

        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });

      it('should respond with FORBIDDEN(403) when room is at full capacity', async () => {
        const user = await createUser();
        const user1 = await createUser();
        const user2 = await createUser();
        const user3 = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        await createBooking(user1.id, room.id);
        await createBooking(user2.id, room.id);
        await createBooking(user3.id, room.id);
  
        const response = await server.post('/bookings').set('Authorization', `Bearer ${token}`).send({
          roomId: room.id,
        });
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it ('should respond with FORBIDDEN(403) when user is not the owner of the booking', async () => {
        const user = await createUser();
        const user1 = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const createdBooking = await createBooking(user1.id, room.id);
    
        const response = await server.put(`/bookings/${createdBooking.id}`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    });

    it('should respond with with NOT_FOUND(404) when bookingId does not exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        await createRoomWithHotelId(hotel.id);
    
        const response = await server.put(`/bookings/1`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });


    it('should respond with OK(200) when roomId and ticket are valid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user)
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const createdBooking = await createBooking(user.id, room.id);

      const response = await server.post(`/bookings/${createdBooking.id}`).set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number)
      });
    });
  });
});
