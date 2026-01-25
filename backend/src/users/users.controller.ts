import { Controller, Get, Body, Param, Delete, Patch, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles('ADMIN', 'CLIENT')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req, @Body() body: { password: string }) {
    return this.usersService.remove(id, req.user, body?.password);
  }

  @Roles('CLIENT')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req) {
    if (req.user.userId !== id) {
      throw new ForbiddenException('Você só pode alterar seu próprio perfil.');
    }

    return this.usersService.update(id, updateUserDto);
  }
}