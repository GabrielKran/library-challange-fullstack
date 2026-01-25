import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { Book } from './src/books/entities/book.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const bookRepo = dataSource.getRepository(Book);

  console.log('🌱 Iniciando Seed (Apenas Criação)...');

  // === CRIAÇÃO DOS LIVROS ===
  console.log('📚 Adicionando livros técnicos...');

  const techBooks = [
    {
      title: 'Node.js Design Patterns',
      author: 'Mario Casciaro',
      description: 'Domine padrões de projeto para criar aplicações Node.js eficientes e escaláveis.',
      imageUrl: 'https://m.media-amazon.com/images/I/71W5FQMX8LL.jpg' 
    },
    {
      title: 'Docker Deep Dive',
      author: 'Nigel Poulton',
      description: 'Domine containers e orquestração com Docker de ponta a ponta.',
      imageUrl: 'https://m.media-amazon.com/images/I/71Bkk+WVLsL._UF1000,1000_QL80_.jpg'
    },
    {
      title: 'Arquitetura Limpa',
      author: 'Robert C. Martin',
      description: 'O guia do artesão para estrutura e design de software.',
      imageUrl: 'https://m.media-amazon.com/images/I/815d9tE7jSL.jpg'
    },
    {
      title: 'Angular: Development with TypeScript',
      author: 'Yakov Fain',
      description: 'Desenvolvimento moderno de frontend utilizando Angular e TypeScript.',
      imageUrl: 'https://m.media-amazon.com/images/I/71HEl0ZR4jL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      description: 'As grandes ideias por trás de sistemas confiáveis e escaláveis.',
      imageUrl: 'https://m.media-amazon.com/images/I/71Le4i4KrFL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      title: 'Padrões de Projeto (GoF)',
      author: 'Erich Gamma',
      description: 'Soluções reutilizáveis de software orientado a objetos.',
      imageUrl: 'https://m.media-amazon.com/images/I/9169z5-CtML._UF1000,1000_QL80_.jpg'
    },
    {
      title: 'Microsserviços Prontos Para a Produção',
      author: 'Susan J. Fowler',
      description: 'Construindo sistemas padronizados em uma organização de engenharia.',
      imageUrl: 'https://m.media-amazon.com/images/I/81wWegQvePL._UF1000,1000_QL80_.jpg'
    },
    {
      title: 'The DevOps Handbook',
      author: 'Gene Kim',
      description: 'Como criar agilidade, confiabilidade e segurança na tecnologia.',
      imageUrl: 'https://m.media-amazon.com/images/I/71mhqEw8LcL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      title: 'Refatoração',
      author: 'Martin Fowler',
      description: 'Aperfeiçoando o projeto de código existente.',
      imageUrl: 'https://m.media-amazon.com/images/I/81qTq0PQp3L._UF1000,1000_QL80_.jpg'
    },
    {
      title: 'Engenharia de Software Moderna',
      author: 'David Farley',
      description: 'Entrega contínua e a ciência no desenvolvimento de software.',
      imageUrl: 'https://m.media-amazon.com/images/I/51YZ7o1Y9JL._SL500_.jpg'
    }
  ];

  for (const bookData of techBooks) {
    // Cria a entidade e salva
    const book = bookRepo.create({
        ...bookData,
        isAvailable: true // Garante que nascem disponíveis
    });
    await bookRepo.save(book);
  }

  console.log('✅ Seed finalizado! Livros adicionados com sucesso.');
  await app.close();
}

bootstrap();