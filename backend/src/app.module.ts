import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Carrega as variáveis do .env
    ConfigModule.forRoot({
      isGlobal:true,
    }),
    
    // Configuração assíncrona do TypeORM
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Escaneia todas as entidades
      synchronize: true, // Cria tabelas sozinho (Auto-DDL).
    }),
    
    UsersModule,
    
    BooksModule,
    
    ReservationsModule,
    
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}