import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, GetUser } from '../auth/decorators';
import { UserRole } from '../../common/enums';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  @Roles(UserRole.ADMINISTRADOR)
  search(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get('me')
  getProfile(@GetUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any, @GetUser() user: any) {
    // Los usuarios solo pueden actualizar su propio perfil, excepto administradores
    if (user.role !== UserRole.ADMINISTRADOR && user.id !== id) {
      throw new Error('No autorizado');
    }
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
