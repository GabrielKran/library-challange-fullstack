import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  // Mocks dos Serviços externos
  const mockUsersService = {
    findByEmailForAuth: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa os mocks para não sujar o próximo teste
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('deve retornar token e usuário se as credenciais forem válidas', async () => {
      // CENÁRIO: Usuário existe e senha bate
      const userMock = {
        id: 'uuid-123',
        email: 'teste@email.com',
        password: 'hashed_password', // Senha criptografada no banco
        name: 'Teste User',
        role: 'CLIENT',
      };

      // 1. Mock do Banco achando o usuário
      mockUsersService.findByEmailForAuth.mockResolvedValue(userMock);
      
      // 2. Mock do Bcrypt dizendo que a senha "123456" bate com "hashed_password"
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // 3. Mock do JWT gerando o token
      mockJwtService.signAsync.mockResolvedValue('token_jwt_valido');

      // AÇÃO
      const result = await service.signIn('teste@email.com', '123456');

      // VALIDAÇÃO
      expect(result).toEqual({
        access_token: 'token_jwt_valido',
        user: {
          id: userMock.id,
          name: userMock.name,
          role: userMock.role,
        },
      });
      expect(mockUsersService.findByEmailForAuth).toHaveBeenCalledWith('teste@email.com');
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException se o e-mail não existir', async () => {
      // CENÁRIO: Usuário não encontrado
      mockUsersService.findByEmailForAuth.mockResolvedValue(null);

      // AÇÃO & VALIDAÇÃO
      await expect(service.signIn('naoexiste@email.com', '123456'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      // CENÁRIO: Usuário existe, mas senha errada
      const userMock = { 
        id: '1', 
        email: 'teste@email.com', 
        password: 'senha_certa_hash' 
      };

      mockUsersService.findByEmailForAuth.mockResolvedValue(userMock);
      
      // Bcrypt diz que NÃO bateu
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // AÇÃO & VALIDAÇÃO
      await expect(service.signIn('teste@email.com', 'senha_errada'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('deve chamar o usersService.create corretamente', async () => {
      const dto = { 
        name: 'Novo', 
        email: 'novo@email.com', 
        cpf: '123', 
        password: '123' 
      };
      
      const expectedResponse = { id: '1', ...dto };
      mockUsersService.create.mockResolvedValue(expectedResponse);

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });
});