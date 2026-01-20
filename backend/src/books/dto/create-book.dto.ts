import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({ message: 'Título é obrigatório' })
  title: string;

  @IsNotEmpty({ message: 'Autor é obrigatório' })
  author: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL da imagem inválida' }) // Valida se é link
  imageUrl?: string;
}