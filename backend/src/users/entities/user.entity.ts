import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 14 }) // CPF formato 000.000.000-00
  cpf: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Importante: Por padrão, não traz a senha nas buscas (segurança)
  password: string;

  @Column({ default: 'CLIENT' }) // 'ADMIN' ou 'CLIENT'
  role: string;

  // Relacionamento: Um usuário pode ter várias reservas
  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}