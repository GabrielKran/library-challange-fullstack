import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true }) // URL da imagem da capa
  imageUrl: string;

  @Column({ default: true }) // Se false, o livro não aparece para reserva [cite: 10]
  isAvailable: boolean;

  @OneToMany(() => Reservation, (reservation) => reservation.book)
  reservations: Reservation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}