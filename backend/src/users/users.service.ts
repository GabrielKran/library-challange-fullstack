import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // 1. Criptografar a senha (Salt de 10 rounds)
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // 2. Criar o objeto (ainda não salvo)
      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        role: 'CLIENT', // Força que todo cadastro público seja CLIENT
      });

      // 3. Salvar no Banco
      const savedUser = await this.usersRepository.save(user);

      // 4. Deleta a senha do objeto ANTES de retornar
      const { password, ...result } = savedUser;

      return result

    } catch (error) {
      // Tratamento de erro de duplicidade (Código 1062 do MySQL)
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('CPF ou Email já cadastrado no sistema.');
      }
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findAll() {
    // Retorna todos os usuários (a senha vem oculta por causa do @Column({select: false}) na Entity)
    return this.usersRepository.find();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['reservations'] 
    });

    if (!user) {
      throw new NotFoundException(`Usuário ID ${id} não encontrado`);
    }

    if (user.reservations.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar usuário que possui histórico de reservas. (Regra de Integridade)'
      );
    }

    return this.usersRepository.remove(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    
    // VALIDA EMAIL DUPLICADO
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      // Se mandou um email novo, verifica se já existe ALGUÉM COM ESSE EMAIL
      const emailExists = await this.usersRepository.findOneBy({ email: updateUserDto.email });
      
      // Se existe E não sou eu mesmo
      if (emailExists && emailExists.id !== id) {
        throw new ConflictException('Este e-mail já está em uso por outro usuário.');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    
    return this.usersRepository.save(user);
  }
}