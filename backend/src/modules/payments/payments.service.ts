import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { PaymentStatus, AccountStatus } from '../../common/enums';

@Injectable()
export class PaymentsService {
  constructor(private supabaseService: SupabaseService) {}

  async createMonthlyPayment(patientId: string, mes: number, anio: number, monto: number) {
    return this.supabaseService.insert('payments', {
      patient_id: patientId,
      mes,
      anio,
      monto,
      status: PaymentStatus.PENDIENTE,
    });
  }

  async findByPatient(patientId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .select('*')
      .eq('patient_id', patientId)
      .order('anio', { ascending: false })
      .order('mes', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getPendingPayments(patientId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', PaymentStatus.PENDIENTE)
      .order('anio', { ascending: true })
      .order('mes', { ascending: true });

    if (error) throw error;
    return data;
  }

  async markAsPaid(paymentId: string, metodoPago: string, referencia?: string) {
    const payment = await this.supabaseService.update('payments', paymentId, {
      status: PaymentStatus.PAGADO,
      fecha_pago: new Date().toISOString(),
      metodo_pago: metodoPago,
      referencia,
    });

    // Verificar si el paciente tiene más pagos pendientes
    const { data: patient } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .select('patient_id')
      .eq('id', paymentId)
      .single();

    const pendingPayments = await this.getPendingPayments(patient.patient_id);

    // Si no tiene más pagos pendientes, reactivar cuenta
    if (pendingPayments.length === 0) {
      const { data: patientData } = await this.supabaseService
        .getAdminClient()
        .from('patients')
        .select('user_id')
        .eq('id', patient.patient_id)
        .single();

      await this.supabaseService.update('users', patientData.user_id, {
        account_status: AccountStatus.ACTIVO,
      });
    }

    return payment;
  }

  async getAllPayments() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .select(`
        *,
        patient:patients(*, user:users(*))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getStatistics() {
    const { data: allPayments } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .select('*');

    const totalPendiente = allPayments
      ?.filter((p) => p.status === PaymentStatus.PENDIENTE)
      .reduce((sum, p) => sum + parseFloat(p.monto), 0);

    const totalPagado = allPayments
      ?.filter((p) => p.status === PaymentStatus.PAGADO)
      .reduce((sum, p) => sum + parseFloat(p.monto), 0);

    return {
      total_pendiente: totalPendiente || 0,
      total_pagado: totalPagado || 0,
      pagos_pendientes: allPayments?.filter((p) => p.status === PaymentStatus.PENDIENTE).length || 0,
      pagos_realizados: allPayments?.filter((p) => p.status === PaymentStatus.PAGADO).length || 0,
    };
  }
}
