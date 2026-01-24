import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

// Data Fixa: 10 de Fevereiro de 2026, meio-dia
const MOCK_CURRENT_DATE = new Date('2026-02-10T12:00:00Z');

describe('ReservationsService', () => {
  let service: ReservationsService;
  
  const mockReservationRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const mockBookRepo = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };
  const mockUserRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_CURRENT_DATE);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getRepositoryToken(Reservation), useValue: mockReservationRepo },
        { provide: getRepositoryToken(Book), useValue: mockBookRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('returnBook (Cálculo de Multa)', () => {
    it('deve calcular a multa corretamente para devolução atrasada (2 dias de atraso)', async () => {
      // Vencimento: 08/Fev. Data Atual (Mock): 10/Fev.
      const pastDueDate = new Date('2026-02-08T12:00:00Z');
      
      const mockReservation = {
        id: 'res-1',
        endDate: pastDueDate,
        status: 'ACTIVE',
        book: { id: 'book-1', isAvailable: false },
      };

      mockReservationRepo.findOne.mockResolvedValue(mockReservation);
      mockReservationRepo.save.mockResolvedValue({ ...mockReservation, status: 'COMPLETED' });

      const result = await service.returnBook('res-1');

      expect(result.daysLate).toBe(2);
      expect(result.fineToPay).toBe(5.5); // 5.00 + (5% * 2)
      expect(mockBookRepo.save).toHaveBeenCalled();
    });

    it('não deve cobrar multa se devolvido no prazo', async () => {
      const futureDate = new Date('2026-02-15T12:00:00Z');
      
      const mockReservation = {
        id: 'res-2',
        endDate: futureDate,
        status: 'ACTIVE',
        book: { id: 'book-2', isAvailable: false },
      };

      mockReservationRepo.findOne.mockResolvedValue(mockReservation);
      mockReservationRepo.save.mockResolvedValue(true);

      const result = await service.returnBook('res-2');

      expect(result.daysLate).toBe(0);
      expect(result.fineToPay).toBe(0);
    });
  });

  describe('create', () => {
    it('deve lançar BadRequestException se o livro estiver indisponível', async () => {
      mockUserRepo.findOneBy.mockResolvedValue({ id: 'user-1' });
      mockBookRepo.findOneBy.mockResolvedValue({ id: 'book-1', isAvailable: false });

      await expect(service.create({ userId: 'user-1', bookId: 'book-1' }))
        .rejects.toThrow(BadRequestException);
    });
  });
});