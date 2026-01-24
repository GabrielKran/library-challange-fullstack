import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let mockBooksRepository;

  beforeEach(async () => {
    // Definindo os mocks para todas as funções que o Service usa
    mockBooksRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),   // Usado no remove
      findOneBy: jest.fn(), // Usado no update/findOne
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),    // <--- O service usa remove, não delete
      merge: jest.fn(),     // <--- O service usa merge
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockBooksRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar uma lista de livros', async () => {
      const listaLivros = [{ title: 'Livro A' }, { title: 'Livro B' }];
      mockBooksRepository.find.mockResolvedValue(listaLivros);

      const result = await service.findAll();

      expect(result).toEqual(listaLivros);
    });
  });

  describe('create', () => {
    it('deve salvar um novo livro', async () => {
      const dadosLivro = { title: 'Harry Potter', author: 'JK' };
      
      mockBooksRepository.create.mockReturnValue(dadosLivro);
      mockBooksRepository.save.mockResolvedValue({ id: '1', ...dadosLivro });

      const result = await service.create(dadosLivro as any);

      expect(result).toHaveProperty('id', '1');
      expect(mockBooksRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar um livro existente', async () => {
      const id = '1';
      const updateData = { title: 'Título Novo' };
      const livroExistente = { id: '1', title: 'Antigo' };
      
      // 1. O Service usa findOneBy no update
      mockBooksRepository.findOneBy.mockResolvedValue(livroExistente);
      
      // 2. Mock do merge (simula a cópia de propriedades)
      mockBooksRepository.merge.mockImplementation((entity, dto) => Object.assign(entity, dto));
      
      // 3. Mock do save
      mockBooksRepository.save.mockResolvedValue({ ...livroExistente, ...updateData });

      const result = await service.update(id, updateData);

      expect(mockBooksRepository.merge).toHaveBeenCalled();
      expect(mockBooksRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Título Novo');
    });

    it('deve lançar NotFoundException se o livro não existir', async () => {
      mockBooksRepository.findOneBy.mockResolvedValue(null);
      
      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover um livro disponível', async () => {
      const id = '1';
      // IMPORTANTE: isAvailable: true para passar na validação
      const livroDisponivel = { id: '1', isAvailable: true };

      mockBooksRepository.findOne.mockResolvedValue(livroDisponivel);
      mockBooksRepository.remove.mockResolvedValue(livroDisponivel);

      await service.remove(id);

      expect(mockBooksRepository.remove).toHaveBeenCalledWith(livroDisponivel);
    });

    it('deve impedir a remoção se o livro estiver emprestado', async () => {
      const id = '1';
      // IMPORTANTE: isAvailable: false simula livro emprestado
      const livroEmprestado = { id: '1', isAvailable: false };

      mockBooksRepository.findOne.mockResolvedValue(livroEmprestado);

      await expect(service.remove(id)).rejects.toThrow(BadRequestException);
    });
  });
});