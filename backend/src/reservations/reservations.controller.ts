import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles('CLIENT', 'ADMIN')
  @Get()
  findAll(@Req() req) {
    return this.reservationsService.findAll(req.user);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.reservationsService.findOne(id);
  // }

  @Roles('CLIENT')
  @Post()
  create(@Body() createReservationDto: CreateReservationDto, @Req() req) {

    const payload = {
      ...createReservationDto,
      userId: req.user.userId,
    };
    return this.reservationsService.create(payload);
  }

  @Roles('ADMIN', 'CLIENT')
  @Post(':id/return')
  returnBook(@Param('id') id: string) {
    return this.reservationsService.returnBook(id);
  }

  // @Roles('CLIENT')
  // @Delete(':id')
  // cancel(@Param('id') id: string) {
  //     return this.reservationsService.cancel(id);
  //   }
}