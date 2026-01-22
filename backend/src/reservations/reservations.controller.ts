import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {

    console.log('PAYLOAD RECEBIDO:', createReservationDto);
    return this.reservationsService.create(createReservationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/return')
  returnBook(@Param('id') id: string) {
    return this.reservationsService.returnBook(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
    remove(@Param('id') id: string) {
      return this.reservationsService.remove(id);
    }
}