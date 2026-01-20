import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsNotEmpty()
  @Length(14, 14, { message: 'O CPF deve ter 14 caracteres (000.000.000-00)' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, { message: 'Formato de CPF inválido. Use 000.000.000-00' }) // Regex simples para garantir formato.
  cpf: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsNotEmpty()
  @Length(6, 20, { message: 'A senha deve ter entre 6 e 20 caracteres' })
  password: string;
}