import { Controller, Get, Patch, Param, Body, UseGuards, Post } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, GetUser } from '../auth/decorators';
import { UserRole } from '../../common/enums';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  findAll() {
    return this.patientsService.findAll();
  }

  @Get('me')
  @Roles(UserRole.PACIENTE)
  getMyProfile(@GetUser() user: any) {
    return this.patientsService.findByUserId(user.id);
  }

  @Get('qr/:token')
  findByQRToken(@Param('token') token: string) {
    return this.patientsService.findByQRToken(token);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.patientsService.update(id, updateData);
  }

  @Post(':id/generate-qr')
  generateQR(@Param('id') id: string) {
    return this.patientsService.generateQR(id);
  }

  @Post(':id/regenerate-qr')
  regenerateQR(@Param('id') id: string) {
    return this.patientsService.regenerateQRToken(id);
  }
}
