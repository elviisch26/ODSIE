import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators';
import { UserRole } from '../../common/enums';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  create(@Body() createDto: any) {
    return this.paymentsService.createMonthlyPayment(
      createDto.patient_id,
      createDto.mes,
      createDto.anio,
      createDto.monto,
    );
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  findAll() {
    return this.paymentsService.getAllPayments();
  }

  @Get('statistics')
  @Roles(UserRole.ADMINISTRADOR)
  getStatistics() {
    return this.paymentsService.getStatistics();
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.paymentsService.findByPatient(patientId);
  }

  @Get('patient/:patientId/pending')
  getPendingPayments(@Param('patientId') patientId: string) {
    return this.paymentsService.getPendingPayments(patientId);
  }

  @Patch(':id/pay')
  @Roles(UserRole.ADMINISTRADOR)
  markAsPaid(@Param('id') id: string, @Body() paymentData: any) {
    return this.paymentsService.markAsPaid(id, paymentData.metodo_pago, paymentData.referencia);
  }
}
