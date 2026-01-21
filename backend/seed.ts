import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';
import { BooksService } from './src/books/books.service';

async function bootstrap() {
  // Cria o contexto da aplicação (conecta no banco)
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const booksService = app.get(BooksService);

  console.log('Iniciando Seed...');

  // 1. Criar Usuários
  const user1 = await usersService.create({
    name: 'Gabriel Tech Lead',
    email: 'admin@library.com',
    cpf: '111.111.111-11',
    password: '123456'
  });
  
  const user2 = await usersService.create({
    name: 'Ana Leitora',
    email: 'ana@library.com',
    cpf: '222.222.222-22',
    password: '123456'
  });

  console.log('Usuários criados');

  // 2. Criar Livros (Com capas reais)
  const books = [
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      imageUrl: 'https://m.media-amazon.com/images/I/41xShlnTZgL._SX218_BO1,204,203,200_QL40_ML2_.jpg',
      description: 'O manual definitivo do código limpo.'
    },
    {
      title: 'O Hobbit',
      author: 'J.R.R. Tolkien',
      imageUrl: 'https://m.media-amazon.com/images/I/91M9xPIf10L._AC_UF1000,1000_QL80_.jpg',
      description: 'Uma jornada inesperada.'
    },
    {
      title: 'Entendendo Algoritmos',
      author: 'Aditya Bhargava',
      imageUrl: 'https://m.media-amazon.com/images/I/71V2362c9ZL._AC_UF1000,1000_QL80_.jpg',
      description: 'Um guia ilustrado para programadores.'
    },
    {
      title: 'Harry Potter e a Pedra Filosofal',
      author: 'J.K. Rowling',
      imageUrl: 'https://m.media-amazon.com/images/I/81ibfYk4qXL._AC_UF1000,1000_QL80_.jpg',
      description: 'O menino que sobreviveu.'
    },
    {
      title: 'Domain-Driven Design',
      author: 'Eric Evans',
      imageUrl: 'https://m.media-amazon.com/images/I/61r4tYIJrML._AC_UF1000,1000_QL80_.jpg',
      description: 'Atacando a complexidade no coração do software.'
    }
  ];

  for (const book of books) {
    await booksService.create(book);
  }

  console.log('Livros criados');
  console.log('Seed finalizado com sucesso');
  
  await app.close();
}

bootstrap();