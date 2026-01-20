import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.reservations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.reservations)
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Column()
  startDate: Date; // Data que pegou o livro

  @Column()
  endDate: Date; // Data limite para devolver (Prazo)

  @Column({ nullable: true })
  returnDate: Date; // Data real que devolveu (Se null, ainda está com o livro)

  @Column({ default: 'ACTIVE' }) // ACTIVE, COMPLETED, CANCELED
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}