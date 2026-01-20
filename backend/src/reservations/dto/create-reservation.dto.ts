import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsUUID(undefined, { message: 'ID do usuário inválido' })
  userId: string;

  @IsNotEmpty()
  @IsUUID(undefined, { message: 'ID do livro inválido' })
  bookId: string;
}