import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

    if (!this.validateCPF(createUserDto.cpf)) {
        throw new BadRequestException('CPF inválido. Dígitos verificadores incorretos.');
    }

    const existingUser = await this.usersRepository.exists({
      where: [
       {email: createUserDto.email},
       {cpf: createUserDto.cpf} 
      ]
    });

    if (existingUser) {
      throw new BadRequestException('Email ou CPF já registrados');
    }

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        role: 'CLIENT',
      });

      const savedUser = await this.usersRepository.save(user);

      const { password, ...result } = savedUser;

      return result

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('CPF ou Email já cadastrado no sistema.');
      }
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async remove(id: string, currentUser: any, passwordConfirmation: string) {
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== id) {
        throw new ForbiddenException('Sem permissão.');
    }

    const user = await this.usersRepository.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.password')
      .leftJoinAndSelect('user.reservations', 'reservations')
      .getOne();

    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (currentUser.role === 'CLIENT') {
        if (!passwordConfirmation) throw new BadRequestException('Senha necessária para excluir conta.');
        const isMatch = await bcrypt.compare(passwordConfirmation, user.password);
        if (!isMatch) throw new UnauthorizedException('Senha incorreta. Não foi possível excluir.');
    }

    const hasPending = user.reservations.some(res => res.status === 'ACTIVE');
    if (hasPending) throw new BadRequestException('Livros pendentes. Devolva antes de excluir.');

    return this.usersRepository.remove(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.password')
      .getOne();

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const isCurrentPasswordValid = await bcrypt.compare(updateUserDto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('A senha atual está incorreta.');
    }

    // ATUALIZAÇÃO DE EMAIL
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.usersRepository.findOneBy({ email: updateUserDto.email });
      if (emailExists && emailExists.id !== id) throw new ConflictException('Email já em uso.');
      user.email = updateUserDto.email;
    }

    // ATUALIZAÇÃO DE NOME
    if (updateUserDto.name) user.name = updateUserDto.name;

    // ATUALIZAÇÃO DE SENHA (NOVA)
    if (updateUserDto.password) {
        const isSamePassword = await bcrypt.compare(updateUserDto.password, user.password);
        if (isSamePassword) {
            throw new BadRequestException('A nova senha não pode ser igual à atual.');
        }

        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    // Remove a senha do objeto de retorno para não vazar
    const savedUser = await this.usersRepository.save(user);
    delete (savedUser as any).password; 
    return savedUser;
  }

  async findByEmailForAuth(email: string) {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role', 'name']
    });
  }

  private validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

    // Cálculo matemático dos dígitos
    const cpfArray = cpf.split('').map(el => +el);
    const rest = (count: number) => (cpfArray.slice(0, count-12)
        .reduce((soma, el, index) => (soma + el * (count-index)), 0) * 10) % 11 % 10;

    return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
  }
}