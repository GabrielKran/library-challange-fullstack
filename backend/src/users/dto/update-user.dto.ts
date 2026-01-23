import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsNotEmpty({ message: 'A senha atual é obrigatória para realizar alterações.' })
    @IsString()
    currentPassword: string;
}
