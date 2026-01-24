import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepository;

  beforeEach(async () => {
    mockUsersRepository = {
      exists: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve lançar BadRequestException se o CPF já existir', async () => {
      mockUsersRepository.exists.mockResolvedValue(true);

      const dto = {
        name: 'Teste',
        email: 'teste@email.com',
        cpf: '529.982.247-25', // CPF válido apenas para focar no teste de duplicidade
        password: '123'
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('deve criar um usuário com sucesso quando os dados forem válidos', async () => {
      mockUsersRepository.exists.mockResolvedValue(false);
      
      const cpfValido = '529.982.247-25'; 
      const dto = { name: 'Novo', email: 'novo@email.com', cpf: cpfValido, password: '123' };
      
      mockUsersRepository.create.mockReturnValue(dto);
      mockUsersRepository.save.mockResolvedValue({ ...dto, id: 'uuid-123' });

      const result = await service.create(dto);

      expect(result).toHaveProperty('id', 'uuid-123');
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException para CPF com dígito verificador inválido', async () => {
       const cpfInvalido = '111.111.111-11'; // Formato válido, mas matemática inválida
       const dto = { name: 'Teste', email: 't@t.com', cpf: cpfInvalido, password: '123456' };

       await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });
});