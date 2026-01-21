import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const { userId, bookId } = createReservationDto;

    // 1. Buscar o Usuário
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // 2. Buscar o Livro
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) throw new NotFoundException('Livro não encontrado');

    // 3. Verifica disponibilidade
    if (!book.isAvailable) {
      throw new BadRequestException('Este livro já está reservado/indisponível.');
    }

    // 4. Calcular Datas (7 dias de prazo)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7); // Data atual + 7 dias

    // 5. Criar a Reserva
    const reservation = this.reservationRepository.create({
      user,
      book,
      startDate,
      endDate,
      status: 'ACTIVE',
    });

    await this.reservationRepository.save(reservation);

    // 6. ATUALIZAR O LIVRO (Travar ele)
    book.isAvailable = false;
    await this.bookRepository.save(book);

    return reservation;
  }

  async findAll() {
    // Traz reserva E dados do livro/usuario conectados
    return this.reservationRepository.find({
      relations: ['user', 'book'], 
    });
  }

  async findOne(id: string) {
    return this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });
  }
  
  async returnBook(reservationId: string) {
    // 1. Achar a reserva (tem que trazer o Livro junto para destravar ele)
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['book'],
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (reservation.status === 'COMPLETED') {
      throw new BadRequestException('Este livro já foi devolvido.');
    }

    // 2. Calcular Atraso e Multa
    const now = new Date();
    const endDate = new Date(reservation.endDate); // O prazo final
    
    // Diferença em milissegundos convertida para dias
    const diffTime = now.getTime() - endDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let fine = 0;
    
    // Se diffDays > 0, está atrasado
    if (diffDays > 0) {
      const fixedFine = 5.00; // Multa fixa de 5 reais
      const dailyInterest = fixedFine * 0.05; // 5% da multa por dia
      fine = fixedFine + (dailyInterest * diffDays);
    }

    // 3. Atualizar a Reserva
    reservation.returnDate = now;
    reservation.status = 'COMPLETED';

    await this.reservationRepository.save(reservation);

    // 4. DESTRAVAR O LIVRO
    const book = reservation.book;
    book.isAvailable = true;
    await this.bookRepository.save(book);

    return {
      message: 'Livro devolvido com sucesso',
      reservationId: reservation.id,
      daysLate: diffDays > 0 ? diffDays : 0,
      fineToPay: fine,
    };
  }

  async remove(id: string) {
    const reservation = await this.reservationRepository.findOne({ 
        where: { id }, relations: ['book'] 
    });
    if (!reservation) throw new NotFoundException('Reserva não encontrada');
    
    if (reservation.status !== 'ACTIVE') {
      throw new BadRequestException('Não é possível cancelar reserva já finalizada');
    }

    // Devolve o livro
    const book = reservation.book;
    book.isAvailable = true;
    await this.bookRepository.save(book);

    return this.reservationRepository.remove(reservation);
  }
  
}