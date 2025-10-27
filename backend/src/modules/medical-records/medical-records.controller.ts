import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto, SignRecordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, GetUser } from '../auth/decorators';
import { UserRole } from '../../common/enums';

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.ADMINISTRADOR)
  create(@Body() createDto: CreateMedicalRecordDto, @GetUser() user: any) {
    return this.medicalRecordsService.create(createDto, user.id);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.medicalRecordsService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR, UserRole.ADMINISTRADOR)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicalRecordDto,
    @GetUser() user: any,
  ) {
    return this.medicalRecordsService.update(id, updateDto, user.id, user.role);
  }

  @Post(':id/sign')
  @Roles(UserRole.DOCTOR)
  signRecord(@Param('id') id: string, @Body() signDto: SignRecordDto, @GetUser() user: any) {
    return this.medicalRecordsService.signRecord(id, user.id, signDto.firma_digital);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.medicalRecordsService.delete(id, user.id, user.role);
  }
}
