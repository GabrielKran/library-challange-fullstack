import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

// Data Fixa: 10 de Fevereiro de 2026, meio-dia
const MOCK_CURRENT_DATE = new Date('2026-02-10T12:00:00Z');

describe('ReservationsService - Testes de Regra de Negócio', () => {
  let service: ReservationsService;
  
  // Mocks: Fingem ser o banco de dados
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
    findOneBy: jest.fn(), // Necessário para validar usuário no create
  };

  beforeEach(async () => {
    // Truque do Jest para congelar o tempo
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
    jest.clearAllMocks(); // Limpa a sujeira entre testes
  });

  describe('Cálculo de Multa (Devolução)', () => {
    it('Deve cobrar R$ 5,50 para 2 dias de atraso', async () => {
      // CENÁRIO: O prazo era dia 08/02. Hoje é dia 10/02.
      const prazoVencido = new Date('2026-02-08T12:00:00Z');
      
      const mockReservation = {
        id: 'res-1',
        endDate: prazoVencido,
        status: 'ACTIVE',
        book: { id: 'book-1', isAvailable: false },
      };

      // Quando o service buscar, retorna essa reserva vencida
      mockReservationRepo.findOne.mockResolvedValue(mockReservation);
      // Quando salvar, retorna ela atualizada
      mockReservationRepo.save.mockResolvedValue({ ...mockReservation, status: 'COMPLETED' });

      // AÇÃO
      const result = await service.returnBook('res-1');

      // VERIFICAÇÃO
      expect(result.daysLate).toBe(2);
      expect(result.fineToPay).toBe(5.5); // 5.00 + (5% * 2)
      expect(mockBookRepo.save).toHaveBeenCalled(); // Garante que destravou o livro
    });

    it('Não deve cobrar multa se entregar no prazo', async () => {
      // CENÁRIO: O prazo é dia 15/02. Hoje é dia 10/02.
      const prazoFuturo = new Date('2026-02-15T12:00:00Z');
      
      const mockReservation = {
        id: 'res-2',
        endDate: prazoFuturo,
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

  describe('Criação de Reserva (Bloqueio)', () => {
    it('NÃO deve permitir reservar livro indisponível', async () => {
      // CENÁRIO: Livro já está emprestado (isAvailable: false)
      const mockUser = { id: 'user-1', name: 'Gabriel' };
      const mockBook = { id: 'book-1', title: 'Clean Code', isAvailable: false };

      mockUserRepo.findOneBy.mockResolvedValue(mockUser);
      mockBookRepo.findOneBy.mockResolvedValue(mockBook);

      // AÇÃO & VERIFICAÇÃO
      // Espera que a função 'create' solte um erro BadRequestException
      await expect(service.create({ userId: 'user-1', bookId: 'book-1' }))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});