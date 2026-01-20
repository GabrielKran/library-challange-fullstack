import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {

    console.log('PAYLOAD RECEBIDO:', createReservationDto);
    return this.reservationsService.create(createReservationDto);
  }

  // Adicione este método novo
  @Post(':id/return')
  returnBook(@Param('id') id: string) {
    return this.reservationsService.returnBook(id);
  }
}