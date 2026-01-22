import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './entities/book.entity';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>
  ) {}

  create(createBookDto: CreateBookDto) {
    const book = this.booksRepository.create(createBookDto);
    return this.booksRepository.save(book);
  }

  findAll() {
    // Retorna todos os livros.
    return this.booksRepository.find();
  }

  async findOne(id: string) {
    const book = await this.booksRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Livro ID ${id} não encontrado`);
    }
    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    const book = await this.booksRepository.findOneBy({ id });
    if (!book) throw new NotFoundException('Livro não encontrado');
    
    this.booksRepository.merge(book, updateBookDto);
    
    return this.booksRepository.save(book);
  }

  async remove(id: string) {
    const book = await this.booksRepository.findOne({
      where: { id }
    });

    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }

    // Se a lista de reservas não for vazia, significa que alguém já pegou esse livro um dia.
    if (!book.isAvailable) {
      throw new BadRequestException(
        'Não é possível apagar este livro pois ele possui histórico de empréstimos.'
      );
    }

    return this.booksRepository.remove(book);
  }
}